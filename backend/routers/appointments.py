from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import get_supabase_client, get_current_user_profile, require_role
from database import supabase_admin
from schemas import AppointmentCreate, AppointmentStatusUpdate
from datetime import datetime, timezone
from services.email import send_appointment_confirmation

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])


def get_doctor_lookup_ids(profile_id: str):
    doctor_ids = [profile_id]
    doctor_res = supabase_admin.table("doctors").select("id").eq("profile_id", profile_id).execute()
    if doctor_res.data:
        doctor_id = doctor_res.data[0].get("id")
        if doctor_id and doctor_id not in doctor_ids:
            doctor_ids.append(doctor_id)
    return doctor_ids


@router.post("/")
def book_appointment(
    data: AppointmentCreate,
    profile=Depends(require_role("patient")),
):
    if data.appointment_date < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot book appointments in the past")

    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        # ── Subscription enforcement ──
        sub_res = supabase_admin.table("subscriptions").select("id").eq(
            "profile_id", profile["id"]
        ).eq("status", "active").execute()

        if not sub_res.data:
            raise HTTPException(
                status_code=403,
                detail="Active PhysioPass subscription required. Visit /plans to subscribe."
            )

        # ── Doctor exists check ──
        doc_res = supabase_admin.table("doctors").select(
            "id, profiles(first_name, last_name)"
        ).eq("id", data.doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")

        doctor = doc_res.data[0]

        # ── Slot conflict check ──
        existing = supabase_admin.table("appointments").select("id").eq(
            "doctor_id", data.doctor_id
        ).eq(
            "appointment_time", data.appointment_date.isoformat()
        ).eq("status", "scheduled").execute()

        if existing.data:
            raise HTTPException(status_code=409, detail="Slot already taken. Please choose a different time.")

        # ── Insert appointment ──
        res = supabase_admin.table("appointments").insert({
            "patient_id": profile["id"],
            "doctor_id": data.doctor_id,
            "appointment_time": data.appointment_date.isoformat(),
            "session_type": data.session_type,
            "status": "scheduled"
        }).execute()

        # ── Send confirmation email (stub) ──
        doctor_profile = doctor.get("profiles") or {}
        if isinstance(doctor_profile, list):
            doctor_profile = doctor_profile[0] if doctor_profile else {}
        doctor_name = f"{doctor_profile.get('first_name', '')} {doctor_profile.get('last_name', '')}".strip() or "Unknown"

        send_appointment_confirmation(
            patient_email=profile.get("email", ""),
            patient_name=profile.get("first_name", "Patient"),
            doctor_name=doctor_name,
            appointment_date=data.appointment_date.isoformat(),
            session_type=data.session_type,
        )

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stats")
def get_appointment_stats(
    profile=Depends(get_current_user_profile)
):
    """Retrieve database-driven statistics and recovery charts."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    role = profile.get("role")
    profile_id = profile["id"]
    
    try:
        if role == "patient":
            # 1. Total sessions completed
            comp_res = supabase_admin.table("appointments").select("id").eq(
                "patient_id", profile_id
            ).eq("status", "completed").execute()
            
            sessions_completed = len(comp_res.data or [])
            
            # 2. Days to full recovery: 24 days default, decrementing by 2 per completed session
            days_to_recovery = max(0, 24 - sessions_completed * 2)
            
            # 3. Dynamic chart progress data
            chart_data = []
            progress_base = 15
            for i in range(1, 7): # Weeks 1 to 6
                week_progress = min(95, progress_base + min(i * 12, sessions_completed * 10 + i * 4))
                chart_data.append({
                    "name": f"Week {i}",
                    "progress": week_progress
                })
                
            return {
                "role": "patient",
                "sessions_completed": sessions_completed,
                "days_to_recovery": days_to_recovery,
                "chart_data": chart_data,
                "percentage_increase": 15 if sessions_completed > 0 else 0
            }
            
        elif role == "doctor":
            # Find the doctor's record id
            doctor_ids = get_doctor_lookup_ids(profile_id)
            
            # 1. Total appointments completed
            comp_res = supabase_admin.table("appointments").select("id").in_(
                "doctor_id", doctor_ids
            ).eq("status", "completed").execute()
            
            sessions_completed = len(comp_res.data or [])
            
            # 2. Total unique patients treated
            patients_res = supabase_admin.table("appointments").select("patient_id").in_(
                "doctor_id", doctor_ids
            ).execute()
            
            unique_patients = list(set([appt["patient_id"] for appt in (patients_res.data or [])]))
            total_patients = len(unique_patients)
            
            return {
                "role": "doctor",
                "sessions_completed": sessions_completed,
                "total_patients": total_patients,
                "practicing_since": profile.get("created_at")
            }
            
        else:
            raise HTTPException(status_code=403, detail="Invalid profile role")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def list_appointments(profile=Depends(get_current_user_profile)):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    role = profile.get("role")
    try:
        if role == "patient":
            res = supabase_admin.table("appointments").select(
                "*, doctors(profiles(first_name, last_name))"
            ).eq("patient_id", profile["id"]).execute()
        elif role == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            query = supabase_admin.table("appointments").select(
                "*, patients(profiles(first_name, last_name))"
            )
            res = query.in_("doctor_id", doctor_ids).execute() if len(doctor_ids) > 1 else query.eq("doctor_id", profile["id"]).execute()
        else:
            raise HTTPException(status_code=403, detail="Invalid role")
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    profile=Depends(get_current_user_profile),
):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appt = res.data[0]

        if profile["role"] == "patient" and appt["patient_id"] != profile["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if profile["role"] == "doctor" and appt["doctor_id"] not in get_doctor_lookup_ids(profile["id"]):
            raise HTTPException(status_code=403, detail="Not authorized")

        update_res = supabase_admin.table("appointments").update(
            {"status": data.status}
        ).eq("id", appointment_id).execute()
        return update_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str

@router.post("/{appointment_id}/room")
def init_appointment_room(
    appointment_id: str,
    profile=Depends(get_current_user_profile)
):
    """Provision a video calling room for the appointment (Doctor or Patient only)."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Fetch appointment to check access
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        appt = res.data[0]
        
        # Check authorization: patient of appointment or doctor of appointment
        is_authorized = False
        if profile["role"] == "patient" and appt["patient_id"] == profile["id"]:
            is_authorized = True
        elif profile["role"] == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            if appt["doctor_id"] in doctor_ids:
                is_authorized = True
                
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Not authorized to initialize room for this appointment")
            
        # If room already exists, return it
        if appt.get("hms_room_id"):
            return {"hms_room_id": appt["hms_room_id"]}
            
        # Create room
        from services.hms import create_hms_room
        room_id = create_hms_room(appointment_id)
        
        # Update appointment
        supabase_admin.table("appointments").update(
            {"hms_room_id": room_id}
        ).eq("id", appointment_id).execute()
        
        return {"hms_room_id": room_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{appointment_id}/room-token")
def get_appointment_room_token(
    appointment_id: str,
    profile=Depends(get_current_user_profile)
):
    """Retrieve token credentials for joining the appointment video call."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Fetch appointment to check access
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        appt = res.data[0]
        
        # Check authorization
        is_authorized = False
        role_name = ""
        if profile["role"] == "patient" and appt["patient_id"] == profile["id"]:
            is_authorized = True
            role_name = "patient"
        elif profile["role"] == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            if appt["doctor_id"] in doctor_ids:
                is_authorized = True
                role_name = "doctor"
                
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Not authorized to join this appointment room")
            
        room_id = appt.get("hms_room_id")
        if not room_id:
            # Auto-provision room if not initialized yet
            from services.hms import create_hms_room
            room_id = create_hms_room(appointment_id)
            supabase_admin.table("appointments").update(
                {"hms_room_id": room_id}
            ).eq("id", appointment_id).execute()
            
        from services.hms import generate_join_token
        token = generate_join_token(room_id, profile["id"], role_name)
        
        return {
            "token": token,
            "room_id": room_id,
            "role": role_name,
            "user_id": profile["id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{appointment_id}/messages")
def get_appointment_messages(
    appointment_id: str,
    profile=Depends(get_current_user_profile)
):
    """Retrieve chat history logs for this appointment (Patient or Doctor only)."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Fetch appointment to check access
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        appt = res.data[0]
        
        # Check authorization
        is_authorized = False
        if profile["role"] == "patient" and appt["patient_id"] == profile["id"]:
            is_authorized = True
        elif profile["role"] == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            if appt["doctor_id"] in doctor_ids:
                is_authorized = True
                
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Not authorized to access messages for this appointment")
            
        # Fetch messages joined with sender profiles
        msg_res = supabase_admin.table("messages").select(
            "*, sender:profiles(first_name, last_name, role)"
        ).eq("appointment_id", appointment_id).order("created_at").execute()
        
        return msg_res.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{appointment_id}/messages")
def send_appointment_message(
    appointment_id: str,
    data: MessageCreate,
    profile=Depends(get_current_user_profile)
):
    """Send a chat message inside the appointment room."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be blank")
        
    try:
        # Fetch appointment to check access
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        appt = res.data[0]
        
        # Check authorization
        is_authorized = False
        if profile["role"] == "patient" and appt["patient_id"] == profile["id"]:
            is_authorized = True
        elif profile["role"] == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            if appt["doctor_id"] in doctor_ids:
                is_authorized = True
                
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Not authorized to send messages for this appointment")
            
        # Insert message
        msg_insert = supabase_admin.table("messages").insert({
            "appointment_id": appointment_id,
            "sender_id": profile["id"],
            "content": data.content,
            "is_read": False
        }).execute()
        
        # Fetch sender metadata to return complete message payload
        inserted_msg = msg_insert.data[0]
        inserted_msg["sender"] = {
            "first_name": profile.get("first_name", ""),
            "last_name": profile.get("last_name", ""),
            "role": profile.get("role", "")
        }
        
        return inserted_msg
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{appointment_id}/messages/read")
def mark_messages_as_read(
    appointment_id: str,
    profile=Depends(get_current_user_profile)
):
    """Mark all unread chat messages in the appointment room as read."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Mark all messages sent by the OTHER participant as read
        supabase_admin.table("messages").update(
            {"is_read": True}
        ).eq("appointment_id", appointment_id).neq("sender_id", profile["id"]).execute()
        
        return {"status": "success", "message": "Messages marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

