# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from dependencies import get_supabase_client, require_role
from schemas import SubscriptionCreate
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/subscriptions", tags=["Subscriptions"])

@router.post("/checkout")
def mock_checkout(
    data: SubscriptionCreate, 
    profile = Depends(require_role("patient")), 
    client: Client = Depends(get_supabase_client)
):
    if data.tier not in ['weekly', 'monthly', 'yearly']:
        raise HTTPException(status_code=400, detail="Invalid tier")
        
    start_date = datetime.utcnow()
    if data.tier == 'weekly':
        end_date = start_date + timedelta(days=7)
    elif data.tier == 'monthly':
        end_date = start_date + timedelta(days=30)
    else:
        end_date = start_date + timedelta(days=365)
        
    try:
        # Cancel any active subscriptions
        client.table("subscriptions").update({"status": "cancelled"}).eq("patient_id", profile["id"]).eq("status", "active").execute()
        
        # Create new subscription
        res = client.table("subscriptions").insert({
            "patient_id": profile["id"],
            "tier": data.tier,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active"
        }).execute()
        
        return {"message": "Payment successful", "subscription": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_my_subscription(profile = Depends(require_role("patient")), client: Client = Depends(get_supabase_client)):
    try:
        res = client.table("subscriptions").select("*").eq("patient_id", profile["id"]).eq("status", "active").execute()
        if not res.data:
            return {"has_active_subscription": False}
        return {"has_active_subscription": True, "subscription": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
