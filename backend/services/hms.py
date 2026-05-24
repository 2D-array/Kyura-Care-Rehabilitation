import os
import time
import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

HMS_ACCESS_KEY = os.environ.get("HMS_ACCESS_KEY")
HMS_SECRET = os.environ.get("HMS_SECRET")


def _is_configured() -> bool:
    """Check if 100ms live video services are fully configured in the environment."""
    return bool(HMS_ACCESS_KEY and HMS_SECRET and not HMS_ACCESS_KEY.startswith("hms_placeholder"))


def create_hms_room(appointment_id: str) -> str:
    """Provision a secure video calling room in 100ms. Returns the room_id."""
    if not _is_configured():
        logger.info(f"[MOCK HMS] Provisioning room for appointment: {appointment_id}")
        return f"mock_room_{appointment_id[:8]}_{int(time.time())}"

    try:
        import jwt
        import requests

        # Generate management token
        iat = int(datetime.now(timezone.utc).timestamp())
        payload = {
            "access_key": HMS_ACCESS_KEY,
            "type": "management",
            "version": 2,
            "iat": iat,
            "exp": iat + 3600,  # 1 hour expiry
            "jti": str(uuid.uuid4())
        }
        
        mgmt_token = jwt.encode(payload, HMS_SECRET, algorithm="HS256")
        
        headers = {
            "Authorization": f"Bearer {mgmt_token}",
            "Content-Type": "application/json"
        }
        
        room_payload = {
            "name": f"curareb-session-{appointment_id[:8]}",
            "description": f"CuraReb Tele-Rehabilitation Session for Appointment {appointment_id}",
            "region": "in"  # Optimized for India
        }
        
        res = requests.post("https://api.100ms.live/v2/rooms", json=room_payload, headers=headers, timeout=10)
        
        if res.status_code in (200, 201):
            room_data = res.json()
            return room_data.get("id")
        else:
            logger.error(f"100ms Rooms API returned error status {res.status_code}: {res.text}")
            raise Exception("Failed to provision room in video calling server.")

    except ImportError:
        logger.warning("PyJWT or requests libraries not found. Falling back to mock 100ms room ID.")
        return f"mock_room_{appointment_id[:8]}_{int(time.time())}"
    except Exception as e:
        logger.error(f"Exception creating 100ms room, falling back to mock: {e}")
        return f"mock_room_{appointment_id[:8]}_{int(time.time())}"


def generate_join_token(room_id: str, user_id: str, role: str) -> str:
    """Generate a HS256 client app token for a user to join a 100ms video room."""
    if not _is_configured() or room_id.startswith("mock_room"):
        logger.info(f"[MOCK HMS] Generating Join Token for room={room_id}, user={user_id}, role={role}")
        return f"mock_token_{user_id[:8]}_{int(time.time())}"

    try:
        import jwt

        iat = int(datetime.now(timezone.utc).timestamp())
        payload = {
            "access_key": HMS_ACCESS_KEY,
            "room_id": room_id,
            "user_id": user_id,
            "role": role,  # 'patient' or 'doctor'
            "type": "app",
            "version": 2,
            "iat": iat,
            "exp": iat + 3600 * 24,  # 24 hours expiry
            "jti": str(uuid.uuid4())
        }

        return jwt.encode(payload, HMS_SECRET, algorithm="HS256")

    except ImportError:
        logger.warning("PyJWT library not found. Returning mock 100ms token.")
        return f"mock_token_{user_id[:8]}_{int(time.time())}"
    except Exception as e:
        logger.error(f"Failed to generate 100ms token: {e}")
        return f"mock_token_{user_id[:8]}_{int(time.time())}"
