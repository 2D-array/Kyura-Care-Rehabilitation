# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from dependencies import get_supabase_client, require_role
from database import supabase_admin
from schemas import DoctorOnboard, DoctorProfileUpdate

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])


PROFILE_FIELDS = {
    "first_name",
    "last_name",
    "phone_number"
}

DOCTOR_FIELDS = {
    "bio",
    "specialty",
    "education_details",
    "years_of_experience",
    "consultation_fee",
    "available_days",
    "available_hours",
    "degree_proofs_link",
    "clinic_name",
    "clinic_address",
    "languages_spoken",
    "registration_number",
    "qualification_proof_url",
    "specialization_certificates"
}


def is_doctor_profile_complete(
    doctor_data: dict,
    profile_data: dict
) -> bool:
    """Check if doctor profile is complete enough to show publicly."""

    has_name = bool(profile_data.get("first_name"))
    has_specialty = bool(
        doctor_data.get("specialty")
        and doctor_data["specialty"] != "General"
    )
    has_bio = bool(doctor_data.get("bio"))

    return has_name and has_specialty and has_bio


@router.put("/me")
def update_doctor_profile(
    data: DoctorProfileUpdate,
    profile=Depends(require_role("doctor"))
):
    try:
        db = supabase_admin
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return {"status": "success", "message": "No changes provided"}

        profile_updates = {k: v for k, v in update_data.items() if k in PROFILE_FIELDS}
        doctor_updates = {k: v for k, v in update_data.items() if k in DOCTOR_FIELDS}

        if profile_updates:
            db.table("profiles").update(profile_updates).eq("id", profile["id"]).execute()

        if doctor_updates:
            db.table("doctors").upsert({
                "profile_id": profile["id"],
                **doctor_updates
            }, on_conflict="profile_id").execute()

        return {"status": "success", "message": "Doctor profile updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/")
def get_doctors():
    try:
        # Use admin client to bypass RLS for public doctor listing
        client = supabase_admin
        if not client:
            raise HTTPException(
                status_code=500,
                detail="Admin client not configured"
            )
        res = client.table("doctors").select("*, profiles(first_name, last_name, email)").execute()

        print("DOCTORS DATA:", res.data)

        return res.data

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/{doctor_id}")
def get_doctor(doctor_id: str):
    try:
        client = supabase_admin
        if not client:
            raise HTTPException(status_code=500, detail="Admin client not configured")

        res = client.table("doctors").select(
            """
            *,
            profiles(
                first_name,
                last_name,
                email,
                phone_number
            )
            """
        ).eq("id", doctor_id).execute()

        if not res.data:
            raise HTTPException(
                status_code=404,
                detail="Doctor not found"
            )

        doc = res.data[0]

        profile_info = doc.get("profiles")

        if isinstance(profile_info, list):
            profile_info = (
                profile_info[0]
                if profile_info
                else {}
            )

        if profile_info is None:
            profile_info = {}

        doc["profile_completed"] = (
            is_doctor_profile_complete(
                doc,
                profile_info
            )
        )

        return doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )