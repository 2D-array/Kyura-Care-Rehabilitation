from fastapi import APIRouter, Depends, HTTPException, Body
from supabase import Client
from dependencies import get_supabase_client, get_current_user
from database import supabase_admin

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@router.post("/sync-profile")
def sync_profile(
    role: str = Body(..., embed=True),
    first_name: str = Body(..., embed=True),
    last_name: str = Body(..., embed=True),
    license_number: str = Body(None, embed=True),
    user = Depends(get_current_user)
):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    
    if role not in ["patient", "doctor"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    try:
        # Check if profile exists
        res = supabase_admin.table("profiles").select("*").eq("id", user.id).execute()
        if not res.data:
            email = user.email or f"{user.id}@anonymous.com"
            
            profile_data = {
                "id": user.id,
                "role": role,
                "first_name": first_name,
                "last_name": last_name,
                "email": email
            }
            supabase_admin.table("profiles").insert(profile_data).execute()
            
            if role == "doctor":
                supabase_admin.table("doctors").insert({
                    "id": user.id,
                    "specialty": "General",
                    "license_number": license_number or "PENDING"
                }).execute()
            else:
                supabase_admin.table("patients").insert({
                    "id": user.id
                }).execute()
                
        return {"status": "success", "message": "Profile synced"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
