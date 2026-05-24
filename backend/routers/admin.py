import logging
from fastapi import APIRouter, Depends, HTTPException
from dependencies import require_role
from database import supabase_admin
from services.notifications import create_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Portal"])

PLAN_PRICE_MAP = {
    "weekly": 499,
    "monthly": 1499,
    "yearly": 9999
}


@router.get("/stats")
def get_admin_stats(admin_profile=Depends(require_role("admin"))):
    """Retrieve platform-wide statistics for the Administrator panel."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Count patients
        pat_res = supabase_admin.table("patients").select("profile_id", count="exact").execute()
        patients_count = pat_res.count if pat_res.count is not None else len(pat_res.data or [])
        
        # Count doctors
        doc_res = supabase_admin.table("doctors").select("id", count="exact").execute()
        doctors_count = doc_res.count if doc_res.count is not None else len(doc_res.data or [])
        
        # Count pending doctors
        pending_res = supabase_admin.table("doctors").select("id", count="exact").eq("is_verified", False).execute()
        pending_count = pending_res.count if pending_res.count is not None else len(pending_res.data or [])
        
        # Calculate platform revenue from active subscriptions
        subs_res = supabase_admin.table("subscriptions").select("tier").eq("status", "active").execute()
        total_revenue = sum(PLAN_PRICE_MAP.get(sub.get("tier"), 0) for sub in (subs_res.data or []))
        
        return {
            "total_patients": patients_count,
            "total_doctors": doctors_count,
            "pending_verifications": pending_count,
            "total_revenue": total_revenue,
            "currency": "INR"
        }
    except Exception as e:
        logger.error(f"Failed to fetch admin stats: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/doctors/pending")
def get_pending_doctors(admin_profile=Depends(require_role("admin"))):
    """Retrieve list of unverified physiotherapist accounts."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        res = supabase_admin.table("doctors").select(
            "*, profiles(first_name, last_name, email, phone_number)"
        ).eq("is_verified", False).execute()
        
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/doctors/{doctor_id}/verify")
def verify_doctor(
    doctor_id: str,
    admin_profile=Depends(require_role("admin"))
):
    """Verify and approve a pending physiotherapist profile."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Check if doctor exists
        doc_res = supabase_admin.table("doctors").select("*, profiles(id)").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        doctor = doc_res.data[0]
        profile_id = doctor["profile_id"]
        
        # Update doctor record to verified
        supabase_admin.table("doctors").update(
            {"is_verified": True}
        ).eq("id", doctor_id).execute()
        
        # Notify the doctor
        create_notification(
            profile_id=profile_id,
            title="Profile Verified! 🎉",
            content="Congratulations! Your physiotherapist registration card has been approved by the platform administrator. You can now configure your schedules and receive client bookings."
        )
        
        return {"status": "success", "message": "Physiotherapist verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/doctors/{doctor_id}/reject")
def reject_doctor(
    doctor_id: str,
    admin_profile=Depends(require_role("admin"))
):
    """Reject and delete a pending unverified physiotherapist profile."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Check if doctor exists
        doc_res = supabase_admin.table("doctors").select("*, profiles(id)").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        doctor = doc_res.data[0]
        profile_id = doctor["profile_id"]
        
        # Remove from doctors table
        supabase_admin.table("doctors").delete().eq("id", doctor_id).execute()
        
        # Notify the profile user
        create_notification(
            profile_id=profile_id,
            title="Application Disapproved ⚠️",
            content="Unfortunately, your physiotherapist application credentials could not be verified by the admin team. Please verify your licensing details and re-apply."
        )
        
        return {"status": "success", "message": "Physiotherapist profile application rejected."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
