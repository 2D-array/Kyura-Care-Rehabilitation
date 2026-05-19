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


def get_doctor_lookup_ids(profile_id: str):
    doctor_ids = [profile_id]
    doctor_res = supabase_admin.table("doctors").select("id").eq("profile_id", profile_id).execute()
    if doctor_res.data:
        doctor_id = doctor_res.data[0].get("id")
        if doctor_id and doctor_id not in doctor_ids:
            doctor_ids.append(doctor_id)
    return doctor_ids


@router.get("/me")
def get_patient_profile(
    profile=Depends(require_role("patient"))
):
    try:
        db = supabase_admin
        res = db.table("patients").select("*").eq("profile_id", profile["id"]).execute()
        patient_data = res.data[0] if res.data else {}
        # Map DB column names to frontend names
        if "primary_injury_condition" in patient_data:
            patient_data["primary_injury"] = patient_data.pop("primary_injury_condition")
        if "medical_history_notes" in patient_data:
            patient_data["medical_history"] = patient_data.pop("medical_history_notes")
        return {**patient_data, **profile, "role": "patient"}
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
            # Map frontend names to DB column names
            if "primary_injury" in patient_updates:
                patient_updates["primary_injury_condition"] = patient_updates.pop("primary_injury")
            if "medical_history" in patient_updates:
                patient_updates["medical_history_notes"] = patient_updates.pop("medical_history")
            
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
            "chronic_conditions, medical_history_notes, primary_injury_condition, "
            "blood_group, weight, height"
        ).eq("profile_id", profile["id"]).execute()

        patient_data = res.data[0] if res.data else {}
        return {
            "allergies": patient_data.get("allergies", ""),
            "current_medications": patient_data.get("current_medications", ""),
            "past_surgeries": patient_data.get("past_surgeries", ""),
            "chronic_conditions": patient_data.get("chronic_conditions", ""),
            "medical_history": patient_data.get("medical_history_notes", ""),
            "primary_injury": patient_data.get("primary_injury_condition", ""),
            "blood_group": patient_data.get("blood_group", ""),
            "weight": patient_data.get("weight", ""),
            "height": patient_data.get("height", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/documents")
def get_patient_documents(profile=Depends(require_role("patient")), client: Client = Depends(get_supabase_client)):
    return {"documents": [], "message": "Document management coming soon"}


@router.get("/doctor/my-patients")
def get_doctor_patients(profile=Depends(require_role("doctor"))):
    """Return patients who have booked appointments with the current doctor."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        doctor_ids = get_doctor_lookup_ids(profile["id"])
        query = supabase_admin.table("appointments").select(
            """
            *,
            patients(
                *,
                profiles(first_name, last_name, email, phone_number)
            )
            """
        ).order("appointment_time", desc=True)
        appointments_res = query.in_("doctor_id", doctor_ids).execute() if len(doctor_ids) > 1 else query.eq("doctor_id", profile["id"]).execute()

        patients_by_id = {}
        for appointment in appointments_res.data or []:
            patient = appointment.get("patients") or {}
            patient_profile = patient.get("profiles") or {}
            patient_id = appointment.get("patient_id")

            if not patient_id:
                continue

            if "primary_injury_condition" in patient:
                patient["primary_injury"] = patient.pop("primary_injury_condition")
            if "medical_history_notes" in patient:
                patient["medical_history"] = patient.pop("medical_history_notes")

            existing = patients_by_id.setdefault(patient_id, {
                "id": patient_id,
                "profile": patient_profile,
                "patient": patient,
                "appointments": []
            })
            appointment["patients"] = None
            existing["appointments"].append(appointment)

        return list(patients_by_id.values())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
