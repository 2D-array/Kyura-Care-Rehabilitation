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

        # Insert review
        res = supabase_admin.table("reviews").insert({
            "patient_id": profile["id"],
            "doctor_id": data.doctor_id,
            "rating": data.rating,
            "comment": data.comment
        }).execute()

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
