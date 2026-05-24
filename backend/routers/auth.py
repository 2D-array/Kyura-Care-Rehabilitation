import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_supabase_client, get_current_user
from database import supabase_admin
from schemas import SyncProfileRequest, ForgotPasswordRequest, ResetPasswordRequest
from services.email import send_otp_email
from services.notifications import create_notification


router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.get("/me")
def get_current_profile(
    user=Depends(get_current_user)
):
    """Unified endpoint — returns full merged profile regardless of role."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        profile_res = supabase_admin.table("profiles").select("*").eq("id", user.id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="Profile not found. Please sync your profile.")

        profile = profile_res.data[0]
        role = profile.get("role")

        if role == "doctor":
            doc_res = supabase_admin.table("doctors").select("*").eq("profile_id", user.id).execute()
            doctor_data = doc_res.data[0] if doc_res.data else {}
            return {**doctor_data, **profile, "role": "doctor"}
        elif role == "admin":
            return {**profile, "role": "admin"}
        else:
            pat_res = supabase_admin.table("patients").select("*").eq("profile_id", user.id).execute()
            patient_data = pat_res.data[0] if pat_res.data else {}
            # Map DB column names to frontend names
            if "primary_injury_condition" in patient_data:
                patient_data["primary_injury"] = patient_data.pop("primary_injury_condition")
            if "medical_history_notes" in patient_data:
                patient_data["medical_history"] = patient_data.pop("medical_history_notes")
            return {**patient_data, **profile, "role": "patient"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sync-profile")
def sync_profile(
    data: SyncProfileRequest,
    user=Depends(get_current_user)
):
    """Creates or updates the profile row after signup/login."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    role = data.role
    if role not in ["patient", "doctor"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'patient' or 'doctor'.")

    try:
        email = user.email or f"{user.id}@anonymous.com"

        # Upsert profile row
        profile_data = {
            "id": user.id,
            "role": role,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": email,
        }
        supabase_admin.table("profiles").upsert(profile_data).execute()

        # Upsert role-specific row
        if role == "doctor":
            supabase_admin.table("doctors").upsert({
                "profile_id": user.id,
                "specialty": "General",
            }, on_conflict="profile_id").execute()
        else:
            supabase_admin.table("patients").upsert({
                "profile_id": user.id
            }, on_conflict="profile_id").execute()

        return {"status": "success", "message": "Profile synced successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    """Sends a 6-digit OTP code to the registered email address to authorize a password reset."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        user_check = supabase_admin.table("profiles").select("id").eq("email", data.email).execute()
        if not user_check.data:
            raise HTTPException(status_code=404, detail="No registered account found with this email address.")

        otp = f"{random.randint(100000, 999999)}"
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

        supabase_admin.table("password_resets").insert({
            "email": data.email,
            "otp": otp,
            "expires_at": expires_at,
            "is_used": False
        }).execute()

        send_otp_email(data.email, otp)

        return {"status": "success", "message": "OTP recovery code sent successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    """Verifies the email OTP and updates the credentials using Supabase Admin Auth services."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        now_str = datetime.now(timezone.utc).isoformat()
        otp_res = supabase_admin.table("password_resets").select("*").eq("email", data.email).eq("otp", data.otp).eq("is_used", False).gte("expires_at", now_str).execute()
        if not otp_res.data:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

        profile_res = supabase_admin.table("profiles").select("id").eq("email", data.email).execute()
        if not profile_res.data:
            raise HTTPException(status_code=444, detail="User profile not found.")
        profile_id = profile_res.data[0]["id"]

        try:
            supabase_admin.auth.admin.update_user_by_id(
                profile_id,
                {"password": data.new_password}
            )
        except Exception:
            try:
                supabase_admin.auth.admin.update_user_by_id(
                    user_id=profile_id,
                    attributes={"password": data.new_password}
                )
            except Exception as auth_err:
                raise HTTPException(status_code=400, detail=f"Failed to reset credentials in auth service: {auth_err}")

        supabase_admin.table("password_resets").update({"is_used": True}).eq("id", otp_res.data[0]["id"]).execute()

        create_notification(
            profile_id=profile_id,
            title="Security Alert: Password Updated",
            content="Your CuraReb account password was successfully reset using email OTP verification."
        )

        return {"status": "success", "message": "Password reset successfully. Please log in with your new credentials."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
