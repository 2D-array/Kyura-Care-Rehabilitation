from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import get_supabase_client, require_role

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])

@router.get("/me")
def get_patient_profile(profile = Depends(require_role("patient")), client: Client = Depends(get_supabase_client)):
    try:
        res = client.table("patients").select("*").eq("id", profile["id"]).execute()
        patient_data = res.data[0] if res.data else {}
        return {**profile, **patient_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
