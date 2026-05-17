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