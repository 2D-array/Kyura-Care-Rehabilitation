import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from supabase import Client
from dependencies import require_role
from database import supabase_admin
from schemas import SubscriptionCreate
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse as parse_date

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/subscriptions", tags=["Subscriptions"])

# ── Razorpay Configuration ──
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET")

# Plan details for display & database dates calculations
PLAN_DETAILS = {
    "weekly": {"price": 499, "days": 7, "label": "Weekly"},
    "monthly": {"price": 1499, "days": 30, "label": "Monthly"},
    "yearly": {"price": 9999, "days": 365, "label": "Yearly"},
}


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    tier: str


def _get_razorpay_client():
    """Lazy-load razorpay client."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET or RAZORPAY_KEY_ID.startswith("rzp_placeholder"):
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception as e:
        logger.warning(f"Failed to initialize Razorpay client: {e}")
        return None


@router.post("/checkout")
def create_checkout(
    data: SubscriptionCreate,
    profile=Depends(require_role("patient")),
):
    """Create a Razorpay Order or fall back to mock checkout."""
    tier = data.tier
    if tier not in PLAN_DETAILS:
        raise HTTPException(status_code=400, detail="Invalid tier. Must be 'weekly', 'monthly', or 'yearly'.")

    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    client = _get_razorpay_client()

    # ── If Razorpay is configured, create real checkout Order ──
    if client:
        try:
            plan = PLAN_DETAILS[tier]
            amount_paise = int(plan["price"] * 100) # Price in paise

            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcp_{profile['id'][:8]}_{int(datetime.now().timestamp())}",
                "notes": {
                    "profile_id": profile["id"],
                    "tier": tier,
                    "email": profile.get("email", "")
                }
            }

            order = client.order.create(data=order_data)

            return {
                "razorpay_order_id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "key_id": RAZORPAY_KEY_ID,
                "tier": tier,
                "profile": {
                    "name": f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip() or "CuraReb Member",
                    "email": profile.get("email", ""),
                    "contact": profile.get("phone_number", "")
                }
            }

        except Exception as e:
            logger.error(f"Razorpay checkout order error: {e}")
            raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")

    # ── Fallback: Mock checkout (no Razorpay credentials configured) ──
    logger.info(f"[MOCK CHECKOUT] tier={tier}, profile_id={profile['id']}")

    start_date = datetime.now(timezone.utc)
    plan_info = PLAN_DETAILS[tier]
    end_date = start_date + timedelta(days=plan_info["days"])

    try:
        # Cancel existing active subscriptions
        supabase_admin.table("subscriptions").update(
            {"status": "cancelled"}
        ).eq("profile_id", profile["id"]).eq("status", "active").execute()

        # Insert new subscription (Populate both plan and tier columns)
        res = supabase_admin.table("subscriptions").insert({
            "profile_id": profile["id"],
            "tier": tier,
            "plan": tier,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active",
            "razorpay_order_id": f"mock_order_{int(datetime.now().timestamp())}",
            "razorpay_payment_id": f"mock_pay_{int(datetime.now().timestamp())}",
            "razorpay_signature": "mock_sig_approved"
        }).execute()

        return {
            "message": "Payment successful (mock)",
            "subscription": res.data[0],
            "mock": True,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
def verify_payment(
    data: RazorpayVerify,
    profile=Depends(require_role("patient")),
):
    """Verify Razorpay payment signature and activate subscription."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")

    client = _get_razorpay_client()
    
    # ── If in Mock Mode, skip signature checks ──
    if not client:
        logger.info(f"[MOCK VERIFY] tier={data.tier}, order={data.razorpay_order_id}")
        start_date = datetime.now(timezone.utc)
        plan_info = PLAN_DETAILS[data.tier]
        end_date = start_date + timedelta(days=plan_info["days"])
        
        try:
            # Cancel current active subs
            supabase_admin.table("subscriptions").update(
                {"status": "cancelled"}
            ).eq("profile_id", profile["id"]).eq("status", "active").execute()
            
            # Insert new subscription (Populate both plan and tier columns)
            res = supabase_admin.table("subscriptions").insert({
                "profile_id": profile["id"],
                "tier": data.tier,
                "plan": data.tier,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "status": "active",
                "razorpay_order_id": data.razorpay_order_id,
                "razorpay_payment_id": data.razorpay_payment_id,
                "razorpay_signature": data.razorpay_signature
            }).execute()
            
            return {
                "status": "success",
                "message": "Payment verified (mock)",
                "subscription": res.data[0]
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    # ── Real Razorpay signature verification ──
    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        })
    except Exception as e:
        logger.error(f"Razorpay signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Payment is valid! Let's activate subscription
    tier = data.tier
    if tier not in PLAN_DETAILS:
        raise HTTPException(status_code=400, detail="Invalid tier")
        
    start_date = datetime.now(timezone.utc)
    plan_info = PLAN_DETAILS[tier]
    end_date = start_date + timedelta(days=plan_info["days"])

    try:
        # Cancel current active subs
        supabase_admin.table("subscriptions").update(
            {"status": "cancelled"}
        ).eq("profile_id", profile["id"]).eq("status", "active").execute()

        # Insert new subscription (Populate both plan and tier columns)
        res = supabase_admin.table("subscriptions").insert({
            "profile_id": profile["id"],
            "tier": tier,
            "plan": tier,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active",
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature
        }).execute()

        return {
            "status": "success",
            "message": "Payment verified successfully",
            "subscription": res.data[0]
        }
    except Exception as e:
        logger.error(f"Database error activating subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhook events (redundant backup)."""
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Webhook secret not configured")

    client = _get_razorpay_client()
    if not client:
        raise HTTPException(status_code=400, detail="Razorpay client not configured")

    payload = await request.body()
    payload_str = payload.decode('utf-8')
    sig_header = request.headers.get("x-razorpay-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing signature header")

    try:
        client.utility.verify_webhook_signature(
            payload_str, sig_header, RAZORPAY_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.error(f"Webhook signature check failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Load JSON payload
    import json
    try:
        event_data = json.loads(payload_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event_data.get("event")
    logger.info(f"Received Razorpay webhook: {event_type}")

    # Handle payment capture / order paid events
    if event_type == "order.paid":
        order_payload = event_data.get("payload", {}).get("order", {}).get("entity", {})
        order_id = order_payload.get("id")
        notes = order_payload.get("notes", {})
        profile_id = notes.get("profile_id")
        tier = notes.get("tier", "monthly")

        # Query payment details if available
        payment_id = event_data.get("payload", {}).get("payment", {}).get("entity", {}).get("id", "webhook_captured")

        if profile_id and order_id:
            try:
                # Check if subscription already exists for this order_id
                existing = supabase_admin.table("subscriptions").select("id").eq("razorpay_order_id", order_id).execute()
                if not existing.data:
                    plan_info = PLAN_DETAILS.get(tier, PLAN_DETAILS["monthly"])
                    start_date = datetime.now(timezone.utc)
                    end_date = start_date + timedelta(days=plan_info["days"])

                    # Cancel active ones
                    supabase_admin.table("subscriptions").update(
                        {"status": "cancelled"}
                    ).eq("profile_id", profile_id).eq("status", "active").execute()

                    # Insert new subscription (Populate both plan and tier columns)
                    supabase_admin.table("subscriptions").insert({
                        "profile_id": profile_id,
                        "tier": tier,
                        "plan": tier,
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                        "status": "active",
                        "razorpay_order_id": order_id,
                        "razorpay_payment_id": payment_id,
                        "razorpay_signature": "verified_by_webhook"
                    }).execute()
                    
                    logger.info(f"Webhook successfully processed subscription for {profile_id}")
            except Exception as e:
                logger.error(f"Webhook database exception: {e}")

    return {"status": "ok"}


@router.get("/me")
def get_my_subscription(profile=Depends(require_role("patient"))):
    """Get current patient's active subscription."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Admin client not configured")
    try:
        res = supabase_admin.table("subscriptions").select("*").eq(
            "profile_id", profile["id"]
        ).eq("status", "active").order("created_at", desc=True).execute()

        if not res.data:
            return {"has_active_subscription": False}

        sub = res.data[0]

        # Check if subscription has expired by date
        end_date = sub.get("end_date")
        if end_date:
            try:
                end_dt = parse_date(end_date)
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=timezone.utc)
                if end_dt < datetime.now(timezone.utc):
                    # Mark as expired
                    supabase_admin.table("subscriptions").update(
                        {"status": "expired"}
                    ).eq("id", sub["id"]).execute()
                    return {"has_active_subscription": False}
            except Exception as e:
                logger.warning(f"Error parsing subscription date: {e}")
                pass

        return {
            "has_active_subscription": True,
            "subscription": sub,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/plans")
def get_plans():
    """Return available subscription plans. Public endpoint."""
    return {
        "plans": [
            {
                "tier": "weekly",
                "label": "PhysioPass Weekly",
                "price": 499,
                "currency": "INR",
                "period": "week",
                "features": [
                    "Unlimited consultations",
                    "Priority booking",
                    "Session recordings",
                    "AI recovery plan",
                ],
            },
            {
                "tier": "monthly",
                "label": "PhysioPass Monthly",
                "price": 1499,
                "currency": "INR",
                "period": "month",
                "popular": True,
                "features": [
                    "Unlimited consultations",
                    "Priority booking",
                    "Session recordings",
                    "AI recovery plan",
                    "24/7 chat support",
                ],
            },
            {
                "tier": "yearly",
                "label": "PhysioPass Yearly",
                "price": 9999,
                "currency": "INR",
                "period": "year",
                "save_percent": 44,
                "features": [
                    "Unlimited consultations",
                    "Priority booking",
                    "Session recordings",
                    "AI recovery plan",
                    "24/7 chat support",
                    "Free recovery kit",
                ],
            },
        ]
    }
