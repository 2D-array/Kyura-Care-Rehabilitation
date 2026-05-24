import logging
from database import supabase_admin

logger = logging.getLogger(__name__)


def create_notification(profile_id: str, title: str, content: str):
    """Securely push an in-app notification to Supabase for the specified user."""
    if not supabase_admin:
        logger.warning("Admin client not configured. Cannot dispatch notification.")
        return None
    try:
        res = supabase_admin.table("notifications").insert({
            "profile_id": profile_id,
            "title": title,
            "content": content,
            "is_read": False
        }).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        return None
