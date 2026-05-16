# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from dependencies import get_supabase_client, require_role
from database import supabase_admin
from schemas import DoctorOnboard, DoctorProfileUpdate

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])

# Fields that live in the profiles table
PROFILE_FIELDS = {"first_name", "last_name", "phone_number"}

# Fields that live in the doctors table
DOCTOR_FIELDS = {
    "bio", "specialty", "education_details", "years_of_experience",
    "consultation_fee", "available_days", "available_hours",
    "degree_proofs_link", "clinic_name", "clinic_address", "languages_spoken",
    "registration_number", "qualification_proof_url", "specialization_certificates"
}


def is_doctor_profile_complete(doctor_data: dict, profile_data: dict) -> bool:
    """Check if a doctor has filled enough info to be listed publicly."""
    has_name = bool(profile_data.get("first_name"))
    has_specialty = bool(doctor_data.get("specialty") and doctor_data["specialty"] != "General")
    has_bio = bool(doctor_data.get("bio"))
    return has_name and has_specialty and has_bio


@router.get("/")
def get_doctors(specialty: str = None, client: Client = Depends(get_supabase_client)):
    query = client.table("doctors").select("*, profiles!inner(first_name, last_name, email, phone_number)")
    if specialty:
        query = query.eq("specialty", specialty)
    try:
        res = query.execute()
        # Filter: only return doctors with completed profiles
        completed = []
        for doc in (res.data or []):
            profile_info = doc.get("profiles", {})
            if is_doctor_profile_complete(doc, profile_info):
                doc["profile_completed"] = True
                completed.append(doc)
        return completed
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
def get_doctor_profile(
    profile=Depends(require_role("doctor"))
):
    try:
        db = supabase_admin
        res = db.table("doctors").select("*").eq("id", profile["id"]).execute()
        doctor_data = res.data[0] if res.data else {}
        completed = is_doctor_profile_complete(doctor_data, profile)
        return {**profile, **doctor_data, "role": "doctor", "profile_completed": completed}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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
                "id": profile["id"],
                **doctor_updates
            }).execute()

        return {"status": "success", "message": "Doctor profile updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/appointments")
def get_doctor_appointments(
    profile=Depends(require_role("doctor")),
    client: Client = Depends(get_supabase_client)
):
    try:
        res = client.table("appointments").select(
            "*, patients(*, profiles(first_name, last_name))"
        ).eq("doctor_id", profile["id"]).order("appointment_date", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/reviews")
def get_doctor_reviews(profile=Depends(require_role("doctor")), client: Client = Depends(get_supabase_client)):
    return {"reviews": [], "average_rating": 0, "total_reviews": 0}


@router.put("/me/availability")
def update_doctor_availability(
    available_days: str,
    available_hours: str,
    profile=Depends(require_role("doctor")),
    client: Client = Depends(get_supabase_client)
):
    try:
        client.table("doctors").upsert({
            "id": profile["id"],
            "available_days": available_days,
            "available_hours": available_hours
        }).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{doctor_id}")
def get_doctor(doctor_id: str, client: Client = Depends(get_supabase_client)):
    try:
        res = client.table("doctors").select(
            "*, profiles!inner(first_name, last_name, email, phone_number)"
        ).eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        doc = res.data[0]
        profile_info = doc.get("profiles", {})
        doc["profile_completed"] = is_doctor_profile_complete(doc, profile_info)
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/onboard")
def onboard_doctor(
    data: DoctorOnboard,
    profile=Depends(require_role("doctor")),
    client: Client = Depends(get_supabase_client)
):
    try:
        res = client.table("doctors").upsert({
            "id": profile["id"],
            "specialty": data.specialty,
            "license_number": data.license_number,
            "bio": data.bio,
            "consultation_fee": data.consultation_fee
        }).execute()
        return res.data[0] if res.data else {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{doctor_id}/verify")
def verify_doctor(doctor_id: str):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("doctors").update({"is_verified": True}).eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"message": "Doctor verified successfully", "doctor": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
