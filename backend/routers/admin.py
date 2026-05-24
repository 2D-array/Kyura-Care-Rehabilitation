import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from dependencies import require_role
from database import supabase_admin
from services.notifications import create_notification
from schemas import MembershipAdminUpdate, RescheduleAdminRequest, AnnouncementRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Portal"])

PLAN_PRICE_MAP = {
    "weekly": 499,
    "monthly": 1499,
    "yearly": 9999
}

PLAN_DAYS_MAP = {
    "weekly": 7,
    "monthly": 30,
    "yearly": 365
}


def log_admin_action(action: str, target_user: str = None):
    """Auxiliary logger to document administrative changes in custom audits table."""
    if not supabase_admin:
        return
    try:
        supabase_admin.table("admin_logs").insert({
            "action": action,
            "target_user": target_user
        }).execute()
    except Exception as e:
        logger.error(f"Failed to record administrative audit log: {e}")


@router.get("/stats")
def get_admin_stats(admin_profile=Depends(require_role("admin"))):
    """Retrieve platform-wide statistics for the Administrator bento boxes."""
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

        # Count active subscriptions
        subs_res = supabase_admin.table("subscriptions").select("tier", count="exact").eq("status", "active").execute()
        active_subs_count = subs_res.count if subs_res.count is not None else len(subs_res.data or [])
        
        # Calculate platform revenue
        total_revenue = sum(PLAN_PRICE_MAP.get(sub.get("tier"), 0) for sub in (subs_res.data or []))

        # Count bookings (scheduled and completed)
        bk_res = supabase_admin.table("appointments").select("id", count="exact").execute()
        bookings_count = bk_res.count if bk_res.count is not None else len(bk_res.data or [])

        # Count cancellations
        cx_res = supabase_admin.table("appointments").select("id", count="exact").eq("status", "cancelled").execute()
        cancellations_count = cx_res.count if cx_res.count is not None else len(cx_res.data or [])
        
        return {
            "total_patients": patients_count,
            "total_doctors": doctors_count,
            "pending_verifications": pending_count,
            "total_bookings": bookings_count,
            "total_cancellations": cancellations_count,
            "active_memberships": active_subs_count,
            "total_revenue": total_revenue,
            "currency": "INR"
        }
    except Exception as e:
        logger.error(f"Failed to fetch admin stats: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/doctors")
def get_all_doctors(admin_profile=Depends(require_role("admin"))):
    """Retrieve full directory of registered physiotherapists (both active & pending)."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("doctors").select(
            "*, profiles(first_name, last_name, email, phone_number)"
        ).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
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
        doc_res = supabase_admin.table("doctors").select("*, profiles(id, email)").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        doctor = doc_res.data[0]
        profile_id = doctor["profile_id"]
        doc_email = doctor.get("profiles", {}).get("email", "Doctor")
        
        supabase_admin.table("doctors").update(
            {"is_verified": True}
        ).eq("id", doctor_id).execute()
        
        create_notification(
            profile_id=profile_id,
            title="Profile Verified! 🎉",
            content="Congratulations! Your physiotherapist registration card has been approved by the platform administrator. You can now configure your schedules and receive client bookings."
        )

        log_admin_action(f"Approved and verified doctor account: {doc_email}", profile_id)
        
        return {"status": "success", "message": "Physiotherapist verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/doctors/{doctor_id}/suspend")
def suspend_doctor(
    doctor_id: str,
    admin_profile=Depends(require_role("admin"))
):
    """Suspend/De-verify an active doctor account."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        doc_res = supabase_admin.table("doctors").select("*, profiles(id, email)").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        doctor = doc_res.data[0]
        profile_id = doctor["profile_id"]
        doc_email = doctor.get("profiles", {}).get("email", "Doctor")
        
        supabase_admin.table("doctors").update(
            {"is_verified": False}
        ).eq("id", doctor_id).execute()
        
        create_notification(
            profile_id=profile_id,
            title="Account Suspended ⚠️",
            content="Your active physiotherapist status has been temporarily suspended by system administrators. Please contact help center."
        )

        log_admin_action(f"Suspended doctor account: {doc_email}", profile_id)
        
        return {"status": "success", "message": "Physiotherapist account suspended."}
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
        doc_res = supabase_admin.table("doctors").select("*, profiles(id, email)").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
            
        doctor = doc_res.data[0]
        profile_id = doctor["profile_id"]
        doc_email = doctor.get("profiles", {}).get("email", "Doctor")
        
        supabase_admin.table("doctors").delete().eq("id", doctor_id).execute()
        
        create_notification(
            profile_id=profile_id,
            title="Application Disapproved ⚠️",
            content="Unfortunately, your physiotherapist application credentials could not be verified by the admin team. Please verify your licensing details and re-apply."
        )

        log_admin_action(f"Rejected pending doctor application: {doc_email}", profile_id)
        
        return {"status": "success", "message": "Physiotherapist profile application rejected."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/memberships")
def get_all_memberships(admin_profile=Depends(require_role("admin"))):
    """Retrieve full directory of patient subscription memberships."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        # Retrieve all patient entries with profile names and subscriptions status
        res = supabase_admin.table("patients").select(
            "*, profiles(first_name, last_name, email)"
        ).execute()
        
        patients_list = res.data or []
        for pat in patients_list:
            profile_id = pat.get("profile_id")
            if profile_id:
                sub_res = supabase_admin.table("subscriptions").select("*").eq("profile_id", profile_id).eq("status", "active").execute()
                pat["active_subscription"] = sub_res.data[0] if sub_res.data else None
                
                sub_history = supabase_admin.table("subscriptions").select("*").eq("profile_id", profile_id).execute()
                pat["subscription_history"] = sub_history.data or []
            else:
                pat["active_subscription"] = None
                pat["subscription_history"] = []
                
        return patients_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/memberships/{profile_id}")
def update_patient_membership(
    profile_id: str,
    data: MembershipAdminUpdate,
    admin_profile=Depends(require_role("admin"))
):
    """Grant, Upgrade, or Revoke membership plans manually for a patient."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Verify patient exists
        prof_res = supabase_admin.table("profiles").select("email").eq("id", profile_id).execute()
        if not prof_res.data:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        user_email = prof_res.data[0]["email"]

        if data.action == "revoke":
            # Cancel active subscriptions
            supabase_admin.table("subscriptions").update(
                {"status": "cancelled"}
            ).eq("profile_id", profile_id).eq("status", "active").execute()
            
            create_notification(
                profile_id=profile_id,
                title="PhysioPass Subscription Revoked ⚠️",
                content="Your active PhysioPass marketplace membership was manually revoked by platform system administrators."
            )
            log_admin_action(f"Revoked active PhysioPass subscription for: {user_email}", profile_id)
            return {"status": "success", "message": "Membership manually revoked."}
            
        elif data.action in ["grant", "upgrade"]:
            tier = data.tier
            if tier not in PLAN_DAYS_MAP:
                raise HTTPException(status_code=400, detail="Invalid plan tier specified")
                
            start_date = datetime.now(timezone.utc)
            end_date = start_date + timedelta(days=PLAN_DAYS_MAP[tier])
            
            # Cancel current active subs
            supabase_admin.table("subscriptions").update(
                {"status": "cancelled"}
            ).eq("profile_id", profile_id).eq("status", "active").execute()
            
            # Insert new subscription
            supabase_admin.table("subscriptions").insert({
                "profile_id": profile_id,
                "tier": tier,
                "plan": tier,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "status": "active"
            }).execute()
            
            create_notification(
                profile_id=profile_id,
                title=f"PhysioPass Membership Activated! 💳",
                content=f"Excellent news! A premium '{tier}' PhysioPass membership has been manually granted to your profile by the admin team."
            )
            log_admin_action(f"Manually granted '{tier}' membership to: {user_email}", profile_id)
            return {"status": "success", "message": f"Membership '{tier}' successfully activated."}
            
        else:
            raise HTTPException(status_code=400, detail="Invalid action parameter")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/bookings")
def get_all_bookings(admin_profile=Depends(require_role("admin"))):
    """Retrieve full directory of all calendar bookings & appointments."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("appointments").select(
            "*, profiles:patient_id(first_name, last_name, email)"
        ).order("appointment_time", desc=True).execute()
        
        bookings = res.data or []
        for bk in bookings:
            doc_id = bk.get("doctor_id")
            if doc_id:
                doc_res = supabase_admin.table("doctors").select(
                    "*, profiles(first_name, last_name, email)"
                ).eq("id", doc_id).execute()
                bk["doctor"] = doc_res.data[0] if doc_res.data else None
            else:
                bk["doctor"] = None
                
        return bookings
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/bookings/{appointment_id}/cancel")
def cancel_booking_admin(
    appointment_id: str,
    admin_profile=Depends(require_role("admin"))
):
    """Force cancel an appointment from administrator panel."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Find booking
        bk_res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not bk_res.data:
            raise HTTPException(status_code=404, detail="Booking record not found")
        booking = bk_res.data[0]
        
        # Update status to cancelled
        supabase_admin.table("appointments").update(
            {"status": "cancelled"}
        ).eq("id", appointment_id).execute()
        
        # Notify patient and doctor
        patient_id = booking["patient_id"]
        create_notification(
            profile_id=patient_id,
            title="Appointment Cancelled by Admin 🛑",
            content=f"Your scheduled session on {booking['appointment_time']} was manually cancelled by CuraReb admin audits. Mock refund initiated."
        )
        
        doc_id = booking["doctor_id"]
        doc_profile_res = supabase_admin.table("doctors").select("profile_id").eq("id", doc_id).execute()
        if doc_profile_res.data:
            create_notification(
                profile_id=doc_profile_res.data[0]["profile_id"],
                title="Appointment Cancelled by Admin 🛑",
                content=f"The scheduled session on {booking['appointment_time']} was manually cancelled by admin audits."
            )
            
        log_admin_action(f"Force cancelled booking ID: {appointment_id}", patient_id)
        return {"status": "success", "message": "Booking force cancelled successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/bookings/{appointment_id}/reschedule")
def reschedule_booking_admin(
    appointment_id: str,
    data: RescheduleAdminRequest,
    admin_profile=Depends(require_role("admin"))
):
    """Force reschedule appointment time from administrator console."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        bk_res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not bk_res.data:
            raise HTTPException(status_code=404, detail="Booking record not found")
        booking = bk_res.data[0]
        
        # Update calendar slot
        supabase_admin.table("appointments").update(
            {"appointment_time": data.new_date}
        ).eq("id", appointment_id).execute()
        
        # Notify patient
        patient_id = booking["patient_id"]
        create_notification(
            profile_id=patient_id,
            title="Appointment Rescheduled by Admin 📅",
            content=f"Your physiotherapist consultation has been manually rescheduled by the admin team to: {data.new_date}."
        )
        
        log_admin_action(f"Rescheduled booking {appointment_id} to {data.new_date}", patient_id)
        return {"status": "success", "message": "Booking rescheduled successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users")
def get_all_users(admin_profile=Depends(require_role("admin"))):
    """Retrieve full platform directory of registered user profiles (patients and doctors)."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("profiles").select("*").order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/users/{profile_id}/ban")
def toggle_ban_user(
    profile_id: str,
    admin_profile=Depends(require_role("admin"))
):
    """Bans or Reactivates a user account profile in the database."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        user_res = supabase_admin.table("profiles").select("email, is_suspended").eq("id", profile_id).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        user = user_res.data[0]
        current_status = user.get("is_suspended", False)
        new_status = not current_status
        
        supabase_admin.table("profiles").update(
            {"is_suspended": new_status}
        ).eq("id", profile_id).execute()
        
        action_word = "Banned" if new_status else "Reactivated"
        log_admin_action(f"{action_word} user account: {user['email']}", profile_id)
        
        return {
            "status": "success",
            "message": f"User account successfully {action_word.lower()}.",
            "is_suspended": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/announce")
def broadcast_announcement(
    data: AnnouncementRequest,
    admin_profile=Depends(require_role("admin"))
):
    """Sends custom in-app notifications/announcements platform-wide to target cohorts."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
        
    try:
        # Retrieve cohort users
        query = supabase_admin.table("profiles").select("id")
        if data.target in ["patients", "doctors"]:
            role_map = {"patients": "patient", "doctors": "doctor"}
            query = query.eq("role", role_map[data.target])
            
        users_res = query.execute()
        users_list = users_res.data or []
        
        if not users_list:
            return {"status": "success", "message": "No users found in target cohort to notify."}
            
        dispatched_count = 0
        for u in users_list:
            create_notification(
                profile_id=u["id"],
                title=data.title,
                content=data.content
            )
            dispatched_count += 1
            
        log_admin_action(f"Broadcast announcement: '{data.title}' to {data.target} cohort.", "SYSTEM")
        return {"status": "success", "message": f"Announcement broadcasted successfully to {dispatched_count} users."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/logs")
def get_admin_audit_logs(admin_profile=Depends(require_role("admin"))):
    """Retrieve history logs of administrator operations."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("admin_logs").select("*").order("created_at", desc=True).limit(50).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
