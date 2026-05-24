# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from dependencies import get_supabase_client, require_role
from database import supabase_admin
from schemas import DoctorOnboard, DoctorProfileUpdate, AvailabilityCreate
from typing import List

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


def _enrich_with_stats(doctors_list: list) -> list:
    """Enrich a list of doctor dicts with average_rating and review_count from doctor_stats view."""
    try:
        doctor_ids = [d["id"] for d in doctors_list if d.get("id")]
        if not doctor_ids:
            return doctors_list

        stats_res = supabase_admin.table("doctor_stats").select("*").in_("id", doctor_ids).execute()
        stats_map = {s["id"]: s for s in (stats_res.data or [])}

        for doc in doctors_list:
            stats = stats_map.get(doc["id"], {})
            doc["average_rating"] = float(stats.get("average_rating", 0))
            doc["review_count"] = int(stats.get("review_count", 0))

        return doctors_list
    except Exception:
        # If doctor_stats view doesn't exist yet, gracefully degrade
        for doc in doctors_list:
            doc["average_rating"] = 0.0
            doc["review_count"] = 0
        return doctors_list


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

        doctors = res.data or []

        # Enrich with rating stats from doctor_stats view
        doctors = _enrich_with_stats(doctors)

        return doctors

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

        # Enrich with stats
        doc = _enrich_with_stats([doc])[0]

        return doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ── Availability Endpoints ──

@router.get("/me/availability")
def get_my_availability(
    profile=Depends(require_role("doctor"))
):
    """Get availability slots for the logged-in doctor."""
    try:
        client = supabase_admin
        if not client:
            raise HTTPException(status_code=500, detail="Admin client not configured")

        doc_res = client.table("doctors").select("id").eq("profile_id", profile["id"]).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")

        doctor_id = doc_res.data[0]["id"]
        res = client.table("availability").select("*").eq(
            "doctor_id", doctor_id
        ).eq("is_active", True).order("day_of_week").order("start_time").execute()

        return res.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{doctor_id}/availability")
def get_doctor_availability(doctor_id: str):
    """Get doctor's weekly availability schedule. Public endpoint."""
    try:
        client = supabase_admin
        if not client:
            raise HTTPException(status_code=500, detail="Admin client not configured")

        # Verify doctor exists
        doc_res = client.table("doctors").select("id").eq("id", doctor_id).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")

        res = client.table("availability").select("*").eq(
            "doctor_id", doctor_id
        ).eq("is_active", True).order("day_of_week").order("start_time").execute()

        return res.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/me/availability")
def update_doctor_availability(
    slots: List[AvailabilityCreate],
    profile=Depends(require_role("doctor"))
):
    """Replace all availability slots for the current doctor."""
    try:
        client = supabase_admin
        if not client:
            raise HTTPException(status_code=500, detail="Admin client not configured")

        # Get doctor record ID
        doc_res = client.table("doctors").select("id").eq("profile_id", profile["id"]).execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Doctor profile not found")

        doctor_id = doc_res.data[0]["id"]

        # Delete existing slots
        client.table("availability").delete().eq("doctor_id", doctor_id).execute()

        # Insert new slots
        if slots:
            new_slots = [
                {
                    "doctor_id": doctor_id,
                    "day_of_week": s.day_of_week,
                    "start_time": s.start_time,
                    "end_time": s.end_time,
                    "session_types": s.session_types,
                    "is_active": True,
                }
                for s in slots
            ]
            client.table("availability").insert(new_slots).execute()

        return {"status": "success", "message": f"{len(slots)} availability slots saved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Reviews (scoped under doctor) ──

@router.get("/{doctor_id}/reviews")
def get_doctor_reviews_paginated(
    doctor_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Paginated reviews for a doctor. Public endpoint."""
    try:
        client = supabase_admin
        if not client:
            raise HTTPException(status_code=500, detail="Admin client not configured")

        offset = (page - 1) * limit

        res = client.table("reviews").select(
            "*, patients(profiles(first_name, last_name))"
        ).eq("doctor_id", doctor_id).order(
            "created_at", desc=True
        ).range(offset, offset + limit - 1).execute()

        # Anonymize patient names to first_name + last_initial
        reviews = []
        for r in (res.data or []):
            patient_profile = (r.get("patients") or {}).get("profiles") or {}
            first_name = patient_profile.get("first_name", "Anonymous")
            last_name = patient_profile.get("last_name", "")
            last_initial = f"{last_name[0]}." if last_name else ""

            reviews.append({
                "id": r["id"],
                "rating": r["rating"],
                "comment": r.get("comment"),
                "created_at": r.get("created_at"),
                "patient_first_name": first_name,
                "patient_last_initial": last_initial,
                "patient_avatar_url": patient_profile.get("avatar_url"),
            })

        return {
            "reviews": reviews,
            "page": page,
            "limit": limit,
            "has_more": len(reviews) == limit,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))