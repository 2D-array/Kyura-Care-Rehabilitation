from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import get_supabase_client, get_current_user_profile, require_role
from schemas import AppointmentCreate, AppointmentStatusUpdate

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

@router.post("/")
def book_appointment(
    data: AppointmentCreate, 
    profile = Depends(require_role("patient")), 
    client: Client = Depends(get_supabase_client)
):
    if data.session_type not in ['online', 'in-clinic', 'at-home']:
        raise HTTPException(status_code=400, detail="Invalid session type")
    
    try:
        # Verify active subscription logic
        sub_res = client.table("subscriptions").select("*").eq("patient_id", profile["id"]).eq("status", "active").execute()
        if not sub_res.data:
            raise HTTPException(status_code=403, detail="Active subscription required to book appointments")

        doc_res = client.table("doctors").select("id").eq("id", data.doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")

        res = client.table("appointments").insert({
            "patient_id": profile["id"],
            "doctor_id": data.doctor_id,
            "appointment_date": data.appointment_date.isoformat(),
            "session_type": data.session_type,
            "status": "scheduled"
        }).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_appointments(profile = Depends(get_current_user_profile), client: Client = Depends(get_supabase_client)):
    role = profile.get("role")
    try:
        if role == "patient":
            res = client.table("appointments").select("*, doctors(profiles(first_name, last_name))").eq("patient_id", profile["id"]).execute()
        elif role == "doctor":
            res = client.table("appointments").select("*, patients(profiles(first_name, last_name))").eq("doctor_id", profile["id"]).execute()
        else:
            raise HTTPException(status_code=403, detail="Invalid role")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str, 
    data: AppointmentStatusUpdate, 
    profile = Depends(get_current_user_profile),
    client: Client = Depends(get_supabase_client)
):
    try:
        res = client.table("appointments").select("*").eq("id", appointment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appt = res.data[0]
        
        if profile["role"] == "patient" and appt["patient_id"] != profile["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if profile["role"] == "doctor" and appt["doctor_id"] != profile["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        update_res = client.table("appointments").update({"status": data.status}).eq("id", appointment_id).execute()
        return update_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
