# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from dependencies import get_supabase_client, require_role, get_current_user
from database import supabase_admin
from schemas import PatientProfileUpdate

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])

# Fields that live in the profiles table
PROFILE_FIELDS = {"first_name", "last_name", "phone_number"}

# Fields that live in the patients table
PATIENT_FIELDS = {
    "emergency_contact", "emergency_contact_phone", "date_of_birth", "address",
    "primary_injury", "medical_history", "gender",
    "blood_group", "insurance_provider", "insurance_id",
    "age", "weight", "height", "allergies",
    "current_medications", "past_surgeries", "chronic_conditions"
}


@router.get("/me")
def get_patient_profile(
    profile=Depends(require_role("patient"))
):
    try:
        db = supabase_admin
        res = db.table("patients").select("*").eq("profile_id", profile["id"]).execute()
        patient_data = res.data[0] if res.data else {}
        return {**profile, **patient_data, "role": "patient"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/me")
def update_patient_profile(
    data: PatientProfileUpdate,
    profile=Depends(require_role("patient"))
):
    try:
        db = supabase_admin
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return {"status": "success", "message": "No changes provided"}

        profile_updates = {k: v for k, v in update_data.items() if k in PROFILE_FIELDS}
        patient_updates = {k: v for k, v in update_data.items() if k in PATIENT_FIELDS}

        if profile_updates:
            db.table("profiles").update(profile_updates).eq("id", profile["id"]).execute()

        if patient_updates:
            db.table("patients").upsert({
                "profile_id": profile["id"],
                **patient_updates
            }, on_conflict="profile_id").execute()

        return {"status": "success", "message": "Patient profile updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/appointments")
def get_patient_appointments(
    profile=Depends(require_role("patient")),
    client: Client = Depends(get_supabase_client)
):
    try:
        res = client.table("appointments").select(
            "*, doctors(*, profiles(first_name, last_name))"
        ).eq("patient_id", profile["id"]).order("appointment_date", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/medical-records")
def get_patient_medical_records(
    profile=Depends(require_role("patient"))
):
    """Get structured medical records for the current patient."""
    try:
        db = supabase_admin
        res = db.table("patients").select(
            "allergies, current_medications, past_surgeries, "
            "chronic_conditions, medical_history, primary_injury, "
            "blood_group, weight, height"
        ).eq("profile_id", profile["id"]).execute()

        patient_data = res.data[0] if res.data else {}
        return {
            "allergies": patient_data.get("allergies", ""),
            "current_medications": patient_data.get("current_medications", ""),
            "past_surgeries": patient_data.get("past_surgeries", ""),
            "chronic_conditions": patient_data.get("chronic_conditions", ""),
            "medical_history": patient_data.get("medical_history", ""),
            "primary_injury": patient_data.get("primary_injury", ""),
            "blood_group": patient_data.get("blood_group", ""),
            "weight": patient_data.get("weight", ""),
            "height": patient_data.get("height", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/documents")
def get_patient_documents(profile=Depends(require_role("patient")), client: Client = Depends(get_supabase_client)):
    return {"documents": [], "message": "Document management coming soon"}
