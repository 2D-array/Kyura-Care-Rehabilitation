from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_supabase_client, require_role, get_current_user_profile
from database import supabase_admin
from schemas import ReviewCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1/reviews", tags=["Reviews"])

@router.get("/{doctor_id}")
def get_doctor_reviews(doctor_id: str):
    try:
        # We join with patients and profiles to get the reviewer's name
        res = supabase_admin.table("reviews").select(
            "*, patients(profiles(first_name, last_name, avatar_url))"
        ).eq("doctor_id", doctor_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
def create_review(
    data: ReviewCreate,
    profile = Depends(require_role("patient"))
):
    try:
        # Check if the doctor exists
        doc_res = supabase_admin.table("doctors").select("id").eq("id", data.doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Basic validation
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        appointment_id = data.appointment_id

        if appointment_id:
            # Check if this appointment belongs to the patient, doctor and is completed
            appt_res = supabase_admin.table("appointments").select("*").eq("id", appointment_id).execute()
            if not appt_res.data:
                raise HTTPException(status_code=404, detail="Appointment slot not found")
            
            appt = appt_res.data[0]
            if appt["patient_id"] != profile["id"]:
                raise HTTPException(status_code=403, detail="Not authorized to review this appointment.")
            if appt["doctor_id"] != data.doctor_id:
                raise HTTPException(status_code=400, detail="Appointment doctor does not match requested doctor.")
            if appt["status"] != "completed":
                raise HTTPException(status_code=400, detail="You can only review completed appointments.")

            # Check duplicate review on this appointment slot
            existing = supabase_admin.table("reviews").select("id").eq("appointment_id", appointment_id).execute()
            if existing.data:
                raise HTTPException(status_code=409, detail="You have already submitted a review for this appointment slot.")
        else:
            # If no appointment ID was supplied, find any completed appointment between this doctor and patient
            completed_appt = supabase_admin.table("appointments").select("id").eq(
                "patient_id", profile["id"]
            ).eq(
                "doctor_id", data.doctor_id
            ).eq(
                "status", "completed"
            ).order("appointment_time", desc=True).limit(1).execute()

            if not completed_appt.data:
                raise HTTPException(
                    status_code=403,
                    detail="You can only review doctors with whom you have had a completed appointment."
                )
            
            # Find if this auto-matched completed appointment already has a review
            matched_id = completed_appt.data[0]["id"]
            existing = supabase_admin.table("reviews").select("id").eq("appointment_id", matched_id).execute()
            if existing.data:
                raise HTTPException(status_code=409, detail="You have already submitted a review for your latest completed session with this doctor.")
            
            appointment_id = matched_id

        # Insert review linked to the verified appointment_id
        res = supabase_admin.table("reviews").insert({
            "patient_id": profile["id"],
            "doctor_id": data.doctor_id,
            "rating": data.rating,
            "comment": data.comment,
            "appointment_id": appointment_id
        }).execute()

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
