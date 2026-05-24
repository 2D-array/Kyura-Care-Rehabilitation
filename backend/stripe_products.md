# Stripe Product Configuration

## PhysioPass Plans

| Plan | Price (INR) | Stripe Price ID | Billing |
|------|-------------|-----------------|---------|
| PhysioPass Weekly | ₹499/week | `price_weekly_xxx` | Recurring weekly |
| PhysioPass Monthly | ₹1,499/month | `price_monthly_xxx` | Recurring monthly |
| PhysioPass Yearly | ₹9,999/year | `price_yearly_xxx` | Recurring yearly |

## Setup Instructions

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create a product called **"PhysioPass"**
3. Add 3 prices:
   - Weekly: ₹499, recurring weekly
   - Monthly: ₹1,499, recurring monthly  
   - Yearly: ₹9,999, recurring yearly
4. Copy each Price ID and update `STRIPE_PRICE_MAP` in `backend/routers/subscriptions.py`
5. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/v1/subscriptions/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
6. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Features Included in PhysioPass

- ✅ Unlimited consultations
- ✅ Priority booking
- ✅ Session recordings
- ✅ AI recovery plan
- ✅ 24/7 chat support
