from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import get_supabase_client, get_current_user_profile, require_role
from database import supabase_admin
from schemas import AppointmentCreate, AppointmentStatusUpdate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])


def get_doctor_lookup_ids(profile_id: str):
    doctor_ids = [profile_id]
    doctor_res = supabase_admin.table("doctors").select("id").eq("profile_id", profile_id).execute()
    if doctor_res.data:
        doctor_id = doctor_res.data[0].get("id")
        if doctor_id and doctor_id not in doctor_ids:
            doctor_ids.append(doctor_id)
    return doctor_ids

@router.post("/")
def book_appointment(
    data: AppointmentCreate,
    profile = Depends(require_role("patient")),
):

    if data.appointment_date < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot book appointments in the past")

    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        doc_res = supabase_admin.table("doctors").select("id").eq("id", data.doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")

        existing = supabase_admin.table("appointments").select("id").eq("doctor_id", data.doctor_id).eq("appointment_time", data.appointment_date.isoformat()).eq("status", "scheduled").execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="This time slot is already booked")

        res = supabase_admin.table("appointments").insert({
            "patient_id": profile["id"],
            "doctor_id": data.doctor_id,
            "appointment_time": data.appointment_date.isoformat(),
            "session_type": data.session_type,
            "status": "scheduled"
        }).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_appointments(profile = Depends(get_current_user_profile)):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    role = profile.get("role")
    try:
        if role == "patient":
            res = supabase_admin.table("appointments").select("*, doctors(profiles(first_name, last_name))").eq("patient_id", profile["id"]).execute()
        elif role == "doctor":
            doctor_ids = get_doctor_lookup_ids(profile["id"])
            query = supabase_admin.table("appointments").select("*, patients(profiles(first_name, last_name))")
            res = query.in_("doctor_id", doctor_ids).execute() if len(doctor_ids) > 1 else query.eq("doctor_id", profile["id"]).execute()
        else:
            raise HTTPException(status_code=403, detail="Invalid role")
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    profile = Depends(get_current_user_profile),
):

    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    try:
        res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appt = res.data[0]

        if profile["role"] == "patient" and appt["patient_id"] != profile["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if profile["role"] == "doctor" and appt["doctor_id"] not in get_doctor_lookup_ids(profile["id"]):
            raise HTTPException(status_code=403, detail="Not authorized")

        update_res = supabase_admin.table("appointments").update({"status": data.status}).eq("id", appointment_id).execute()
        return update_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
