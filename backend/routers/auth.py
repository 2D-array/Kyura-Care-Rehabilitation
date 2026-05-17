from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_supabase_client, get_current_user
from database import supabase_admin
from schemas import SyncProfileRequest


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
