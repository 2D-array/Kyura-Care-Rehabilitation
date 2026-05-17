"use client"

import { motion } from "framer-motion"
import { Gift, Zap, Clock, ArrowRight, Sparkles, Tag, BadgePercent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const OFFERS = [
  {
    title: "First Session FREE",
    description: "New users get their first consultation absolutely free with any specialist.",
    badge: "New User",
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-600",
    cta: "Claim Now",
    href: "/auth/signup",
    expiry: "Limited time",
  },
  {
    title: "20% Off Recovery Bundles",
    description: "Save on 5-session and 10-session recovery packages with top-rated physiotherapists.",
    badge: "Popular",
    icon: Tag,
    gradient: "from-emerald-500 to-teal-600",
    cta: "View Packages",
    href: "/doctors",
    expiry: "Ends this month",
  },
  {
    title: "Refer & Earn ₹500",
    description: "Refer a friend and both of you get ₹500 off your next session.",
    badge: "Referral",
    icon: Gift,
    gradient: "from-amber-500 to-orange-600",
    cta: "Start Referring",
    href: "/dashboard",
    expiry: "Ongoing",
  },
  {
    title: "Flash Deal: Weekend Sessions",
    description: "Book weekend sessions at flat 30% off. Limited slots available every week.",
    badge: "Flash",
    icon: Zap,
    gradient: "from-rose-500 to-pink-600",
    cta: "Book Now",
    href: "/doctors",
    expiry: "Every weekend",
  },
]

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-transparent to-transparent dark:from-amber-900/20 dark:via-transparent dark:to-transparent -z-10" />
        <div className="container max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700 font-bold text-sm px-4 py-1.5">
              <BadgePercent className="w-4 h-4 mr-1.5" /> Exclusive Deals
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Offers & <span className="text-amber-600 dark:text-amber-400">Deals</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Save on your recovery journey with exclusive discounts and limited-time offers.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((offer, idx) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Card className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${offer.gradient} opacity-10 rounded-bl-full -z-10 group-hover:opacity-20 transition-opacity`} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center shadow-lg`}>
                      <offer.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="rounded-full font-bold text-xs border-slate-200 dark:border-slate-700">
                      {offer.badge}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {offer.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {offer.expiry}
                    </div>
                    <Link href={offer.href}>
                      <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 shadow-md hover:shadow-lg transition-all">
                        {offer.cta} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
