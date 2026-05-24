"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { motion } from "framer-motion"
import { Check, Shield, Zap, Sparkles, Award, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

type Plan = {
  tier: "weekly" | "monthly" | "yearly"
  label: string
  price: number
  currency: string
  period: string
  features: string[]
  popular?: boolean
  save_percent?: number
}

const STATIC_PLANS: Plan[] = [
  {
    tier: "weekly",
    label: "PhysioPass Weekly",
    price: 499,
    currency: "INR",
    period: "week",
    features: [
      "Unlimited consultations",
      "Priority booking slots",
      "Session video recordings",
      "AI customized recovery plan"
    ]
  },
  {
    tier: "monthly",
    label: "PhysioPass Monthly",
    price: 1499,
    currency: "INR",
    period: "month",
    popular: true,
    features: [
      "Unlimited consultations",
      "Priority booking slots",
      "Session video recordings",
      "AI customized recovery plan",
      "24/7 priority chat support"
    ]
  },
  {
    tier: "yearly",
    label: "PhysioPass Yearly",
    price: 9999,
    currency: "INR",
    period: "year",
    save_percent: 44,
    features: [
      "Unlimited consultations",
      "Priority booking slots",
      "Session video recordings",
      "AI customized recovery plan",
      "24/7 priority chat support",
      "Free premium recovery kit"
    ]
  }
]

export default function PlansPage() {
  const { profile, session } = useUser()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>(STATIC_PLANS)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/plans`)
        if (res.ok) {
          const data = await res.json()
          if (data.plans) {
            setPlans(data.plans)
          }
        }
      } catch (err) {
        console.warn("Could not fetch pricing plans from backend, using static details.", err)
      }
    }
    fetchPlans()
  }, [])

  const handleSubscribe = async (tier: string) => {
    if (!session?.access_token) {
      toast.error("Please log in to purchase a subscription.")
      router.push("/auth")
      return
    }

    if (profile?.role !== "patient") {
      toast.error("Subscriptions are only available for patient accounts.")
      return
    }

    setLoadingPlan(tier)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ tier })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Checkout session generation failed.")
      }

      const data = await res.json()

      // Handle Mock Checkout Fallback
      if (data.mock) {
        toast.success("PhysioPass subscription activated instantly (Mock mode)!")
        router.push("/dashboard")
        return
      }

      // Handle real Razorpay Payment
      if (!window || !(window as any).Razorpay) {
        toast.error("Razorpay SDK failed to load. Please try again.")
        setLoadingPlan(null)
        return
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "CuraReb PhysioPass",
        description: `${data.tier.toUpperCase()} Subscription Plan`,
        order_id: data.razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier
              })
            })

            if (verifyRes.ok) {
              toast.success("Payment verified and PhysioPass tier activated! 🎉")
              router.push("/dashboard")
            } else {
              const verifyErr = await verifyRes.json().catch(() => ({}))
              toast.error(verifyErr.detail || "Verification failed. Please contact support.")
            }
          } catch (verifyErr) {
            console.error("Verification endpoint error:", verifyErr)
            toast.error("Network issue verifying payment. Rest assured we've logged it.")
          }
        },
        prefill: {
          name: data.profile.name,
          email: data.profile.email,
          contact: data.profile.contact
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment checkout cancelled.")
            setLoadingPlan(null)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (err: any) {
      console.error("Subscription checkout error:", err)
      toast.error(err.message || "An unexpected error occurred during subscription onboarding.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden pt-24 pb-20">
      {/* Script injection for Razorpay Checkout SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => console.error("Razorpay script load error")}
      />

      {/* Modern gradient background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[6s]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider"
          >
            <Shield className="w-3.5 h-3.5" /> CURAREB PHYSIOPASS
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            Accelerate Your <span className="text-indigo-600 dark:text-indigo-400">Recovery Journey</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed"
          >
            Unlock unlimited consultations, priority appointment bookings, specialized AI assistance, and full-featured progress logs.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isMonthly = plan.tier === "monthly"
            const isYearly = plan.tier === "yearly"

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex"
              >
                <Card
                  className={`w-full flex flex-col justify-between rounded-[2.5rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border transition-all duration-300 relative ${
                    isMonthly
                      ? "border-indigo-500 dark:border-indigo-500/50 shadow-[0_20px_50px_rgba(79,70,229,0.12)] scale-[1.03] z-10 hover:shadow-[0_20px_50px_rgba(79,70,229,0.22)]"
                      : "border-slate-200/60 dark:border-white/5 shadow-md hover:shadow-xl hover:scale-[1.01]"
                  }`}
                >
                  {/* Popular Tag */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  )}

                  {/* Year Savings Tag */}
                  {plan.save_percent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3" /> Save {plan.save_percent}%
                    </div>
                  )}

                  <div className="p-8 pb-4">
                    {/* Header */}
                    <div className="space-y-1 mb-6">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{plan.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Ideal for {isMonthly ? "steady physical therapy cycles" : isYearly ? "comprehensive long-term rehab plans" : "instant post-surgery checkups"}.
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-8">
                      <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        /{plan.period}
                      </span>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">What's included:</p>
                      <ul className="space-y-3.5">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-tight">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="p-8 pt-4">
                    <Button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={loadingPlan !== null}
                      className={`w-full h-13 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-md transition-all ${
                        isMonthly
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white shadow-none"
                      }`}
                    >
                      {loadingPlan === plan.tier ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Subscribe Now <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Money back and trust tags */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 border-t border-slate-200/50 dark:border-white/5 pt-10 text-slate-400 font-medium text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Secure 256-bit Razorpay Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Instant Membership Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Highly Rated Physiotherapists Only</span>
          </div>
        </div>

      </div>
    </div>
  )
}
