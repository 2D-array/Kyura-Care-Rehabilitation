from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import get_supabase_client, require_role
from database import supabase_admin
from schemas import DoctorOnboard

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])

@router.get("/")
def get_doctors(specialty: str = None, client: Client = Depends(get_supabase_client)):
    query = client.table("doctors").select("*, profiles!inner(first_name, last_name, email)")
    if specialty:
        query = query.eq("specialty", specialty)
    try:
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_doctor_profile(profile = Depends(require_role("doctor")), client: Client = Depends(get_supabase_client)):
    try:
        res = client.table("doctors").select("*").eq("id", profile["id"]).execute()
        doctor_data = res.data[0] if res.data else {}
        return {**profile, **doctor_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{doctor_id}")
def get_doctor(doctor_id: str, client: Client = Depends(get_supabase_client)):
    try:
        res = client.table("doctors").select("*, profiles!inner(first_name, last_name, email)").eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/onboard")
def onboard_doctor(
    data: DoctorOnboard, 
    profile = Depends(require_role("doctor")),
    client: Client = Depends(get_supabase_client)
):
    try:
        res = client.table("doctors").upsert({
            "id": profile["id"],
            "specialty": data.specialty,
            "license_number": data.license_number,
            "bio": data.bio,
            "consultation_fee": data.consultation_fee
            # is_verified is NOT included, thus it defaults to false or retains its value
        }).execute()
        return res.data[0] if res.data else {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{doctor_id}/verify")
def verify_doctor(doctor_id: str):
    # This uses the supabase_admin (service_role) to bypass RLS, simulating an admin action
    if not supabase_admin:
         raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("doctors").update({"is_verified": True}).eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"message": "Doctor verified successfully", "doctor": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
