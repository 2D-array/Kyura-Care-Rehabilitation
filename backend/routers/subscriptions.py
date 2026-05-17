from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from dependencies import require_role
from database import supabase_admin
from schemas import SubscriptionCreate
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/v1/subscriptions", tags=["Subscriptions"])

@router.post("/checkout")
def mock_checkout(
    data: SubscriptionCreate,
    profile = Depends(require_role("patient")),
):
    if data.tier not in ['weekly', 'monthly', 'yearly']:
        raise HTTPException(status_code=400, detail="Invalid tier")

    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    start_date = datetime.now(timezone.utc)
    days = {"weekly": 7, "monthly": 30, "yearly": 365}
    end_date = start_date + timedelta(days=days[data.tier])

    try:
        supabase_admin.table("subscriptions").update({"status": "cancelled"}).eq("profile_id", profile["id"]).eq("status", "active").execute()

        res = supabase_admin.table("subscriptions").insert({
            "profile_id": profile["id"],
            "tier": data.tier,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active"
        }).execute()

        return {"message": "Payment successful", "subscription": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_my_subscription(profile = Depends(require_role("patient"))):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("subscriptions").select("*").eq("profile_id", profile["id"]).eq("status", "active").execute()
        if not res.data:
            return {"has_active_subscription": False}
        return {"has_active_subscription": True, "subscription": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
