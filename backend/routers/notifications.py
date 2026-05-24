import logging
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user_profile
from database import supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["In-App Notifications"])


@router.get("/")
def get_user_notifications(profile=Depends(get_current_user_profile)):
    """Retrieve in-app notifications history list for the authenticated profile."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        res = supabase_admin.table("notifications").select("*").eq(
            "profile_id", profile["id"]
        ).order("created_at", desc=True).limit(20).execute()
        
        return res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch user notifications: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{notif_id}/read")
def mark_notification_as_read(
    notif_id: str,
    profile=Depends(get_current_user_profile)
):
    """Mark a specific notification log entry as read by the user."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Check authorization
        notif_res = supabase_admin.table("notifications").select("profile_id").eq("id", notif_id).execute()
        if not notif_res.data:
            raise HTTPException(status_code=404, detail="Notification not found")
            
        if notif_res.data[0]["profile_id"] != profile["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this notification log")
            
        res = supabase_admin.table("notifications").update(
            {"is_read": True}
        ).eq("id", notif_id).execute()
        
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
