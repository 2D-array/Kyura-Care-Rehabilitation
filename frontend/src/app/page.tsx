"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Activity, Heart, Home as HomeIcon, Search, Bell, ShoppingCart,
  Star, ChevronRight, Shield, Clock, Award, Users, Phone,
  MapPin, CheckCircle, ArrowRight, Zap, Menu, X, ChevronDown,
  Stethoscope, Pill, Ambulance, MessageCircle, Video, Calendar,
  TrendingUp, BadgeCheck, Headphones, Package, Truck, RefreshCcw,
  PlayCircle, ThumbsUp
} from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'

const SPECIALTIES = [
  { icon: "🦴", label: "Ortho" },
  { icon: "🧠", label: "Neuro" },
  { icon: "❤️", label: "Cardio" },
  { icon: "🦷", label: "Dental" },
  { icon: "👁️", label: "Eye" },
  { icon: "🤰", label: "Maternity" },
  { icon: "🧘", label: "Physio" },
  { icon: "💉", label: "Diabetes" },
]

const OFFERS = [
  { tag: "MEGA DEAL", title: "First Consultation FREE", sub: "For new users. Online or in-clinic.", color: "from-orange-500 to-red-500", badge: "🔥 Limited" },
  { tag: "FLAT 30% OFF", title: "Home Physiotherapy", sub: "Book 3+ sessions & save big.", color: "from-blue-600 to-indigo-600", badge: "⚡ Popular" },
  { tag: "CASHBACK ₹200", title: "PhysioPass Membership", sub: "Unlimited consultations / month.", color: "from-emerald-500 to-teal-600", badge: "💚 Best Value" },
]

const DOCTORS = [
  { name: "Dr. Priya Sharma", spec: "Sports Physio", exp: "12 yrs", rating: 4.9, reviews: 1240, fee: "₹499", tag: "Top Rated", img: "👩‍⚕️" },
  { name: "Dr. Rahul Mehta", spec: "Neuro Rehab", exp: "9 yrs", rating: 4.8, reviews: 890, fee: "₹599", tag: "Expert", img: "👨‍⚕️" },
  { name: "Dr. Ananya Rao", spec: "Ortho Physio", exp: "15 yrs", rating: 5.0, reviews: 2100, fee: "₹699", tag: "Star Doctor", img: "👩‍⚕️" },
  { name: "Dr. Kiran Patel", spec: "Pain Management", exp: "8 yrs", rating: 4.7, reviews: 670, fee: "₹449", tag: "Available Now", img: "👨‍⚕️" },
]

const TESTIMONIALS = [
  { name: "Meera K.", loc: "Bangalore", text: "After my accident I was in so much pain. Within 6 sessions I was walking normally again! The at-home service is a blessing.", rating: 5, tag: "Verified Patient" },
  { name: "Arjun S.", loc: "Mumbai", text: "Dr. Ananya's online session was as effective as being there in person. App is super smooth. Highly recommend!", rating: 5, tag: "Online Consult" },
  { name: "Sunita T.", loc: "Delhi", text: "PhysioPass saved me ₹4000 in a single month. Best investment for my spine recovery journey.", rating: 5, tag: "PhysioPass User" },
]

const STATS = [
  { value: "2M+", label: "Consultations Done", icon: Stethoscope },
  { value: "500+", label: "Expert Specialists", icon: BadgeCheck },
  { value: "98.4%", label: "Recovery Success", icon: TrendingUp },
  { value: "24/7", label: "Always Available", icon: Headphones },
]

const HOW = [
  { step: "01", icon: Search, title: "Search & Discover", desc: "Browse 500+ verified specialists by condition, location, or time slot.", color: "#FF6B35" },
  { step: "02", icon: Calendar, title: "Book Instantly", desc: "Pick online, in-clinic or at-home. Real-time slots. Instant confirmation.", color: "#0066CC" },
  { step: "03", icon: Video, title: "Connect & Heal", desc: "HD video, chat, or door-step visit. Track progress on your dashboard.", color: "#00A651" },
]

const SERVICES = [
  { icon: Video, title: "Video Consultation", desc: "Talk to a specialist in minutes from your phone.", color: "#0066CC", bg: "#E8F0FA", stat: "Avg wait < 5 mins" },
  { icon: HomeIcon, title: "At-Home Physio", desc: "Certified therapists at your doorstep, same day.", color: "#00A651", bg: "#E6F7EE", stat: "200+ cities covered" },
  { icon: Activity, title: "In-Clinic Session", desc: "Advanced equipment & hands-on manipulation.", color: "#FF6B35", bg: "#FFF0E8", stat: "1500+ partner clinics" },
  { icon: Pill, title: "Recovery Kits", desc: "Curated rehab equipment delivered to you.", color: "#9B59B6", bg: "#F3EAF9", stat: "Ships in 24 hrs" },
]

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [activeOffer, setActiveOffer] = useState(0)
  const [cartCount] = useState(2)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveOffer(o => (o + 1) % OFFERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="landing-page flex flex-col min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', 'Nunito', sans-serif", background: "var(--landing-page-bg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .landing-page {
          --landing-page-bg: #F4F6FB;
          --landing-hero-bg: linear-gradient(135deg, #EBF4FF 0%, #F0FFF8 50%, #FFF4EE 100%);
          --landing-hero-overlay: radial-gradient(circle at 20% 50%, rgba(0,102,204,.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,166,81,.08) 0%, transparent 60%);
          --landing-surface: #fff;
          --landing-muted-surface: #F4F6FB;
          --landing-hover-surface: #EBF4FF;
          --landing-border: #E8EDF5;
          --landing-heading: #0D1B2A;
          --landing-body: #4A5568;
          --landing-muted: #888;
          --landing-chip-text: #444;
          --landing-button-text: #333;
          --landing-online-avatar-border: #fff;
        }
        .dark .landing-page {
          --landing-page-bg: #020617;
          --landing-hero-bg: linear-gradient(135deg, #020617 0%, #03111f 52%, #04130f 100%);
          --landing-hero-overlay: radial-gradient(circle at 20% 50%, rgba(0,102,204,.16) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,166,81,.14) 0%, transparent 60%);
          --landing-surface: rgba(15, 23, 42, .82);
          --landing-muted-surface: rgba(15, 23, 42, .72);
          --landing-hover-surface: rgba(30, 41, 59, .9);
          --landing-border: rgba(255,255,255,.1);
          --landing-heading: #f8fafc;
          --landing-body: #cbd5e1;
          --landing-muted: #94a3b8;
          --landing-chip-text: #e2e8f0;
          --landing-button-text: #e2e8f0;
          --landing-online-avatar-border: #020617;
        }
        .navlink { font-size:14px; font-weight:600; color:#1a1a2e; transition:color .2s; cursor:pointer; }
        .navlink:hover { color:#0066CC; }
        .pill-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:700;transition:all .2s; cursor:pointer; }
        .search-suggestion { display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .15s; }
        .search-suggestion:hover { background:#F0F4FF; }
        .offer-card { border-radius:20px;padding:20px;color:#fff;position:relative;overflow:hidden;cursor:pointer; }
        @media (min-width: 640px) {
          .offer-card { padding:24px 28px; }
        }
        .doc-card { background:#fff;border-radius:20px;padding:20px;border:1.5px solid #E8EDF5;transition:all .25s;cursor:pointer; }
        .doc-card:hover { border-color:#0066CC;box-shadow:0 8px 32px rgba(0,102,204,.12);transform:translateY(-4px); }
        .stat-pill { display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700; }
        .service-card { background:#fff;border-radius:24px;padding:28px;border:1.5px solid #E8EDF5;transition:all .25s;cursor:pointer;display:flex;flex-direction:column;gap:14px; }
        .service-card:hover { box-shadow:0 16px 48px rgba(0,0,0,.1);transform:translateY(-6px); }
        .testi-card { background:#fff;border-radius:20px;padding:24px;border:1.5px solid #E8EDF5; }
        .scroll-x::-webkit-scrollbar { display:none; }
        .scroll-x { -ms-overflow-style:none;scrollbar-width:none; }
        .hero-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(0,102,204,.08);border:1px solid rgba(0,102,204,.2);border-radius:100px;padding:6px 16px;font-size:13px;font-weight:700;color:#0066CC; }
        .section-tag { display:inline-block;background:#FFF0E8;color:#FF6B35;font-size:12px;font-weight:800;padding:4px 14px;border-radius:100px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-track { display:flex;width:max-content;animation:marquee 18s linear infinite; }
        .marquee-track:hover { animation-play-state:paused; }
        @keyframes pulse-ring { 0%{transform:scale(.9);opacity:.7} 100%{transform:scale(1.3);opacity:0} }
        .pulse-ring { animation:pulse-ring 1.8s ease-out infinite; }
        .gradient-text { background:linear-gradient(135deg,#0066CC,#00A651);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .green-dot { width:8px;height:8px;background:#00A651;border-radius:50%;display:inline-block;margin-right:6px; }
        .floating { animation: floatUpDown 4s ease-in-out infinite; }
        @keyframes floatUpDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .dark .landing-page,
        .dark .landing-page section[style*="#F4F6FB"],
        .dark .landing-page section[style*="#fff"],
        .dark .landing-page [style*="linear-gradient(135deg, #EBF4FF"],
        .dark .landing-page [style*="linear-gradient(135deg,#EBF4FF"],
        .dark .landing-page [style*="background: #F4F6FB"],
        .dark .landing-page [style*="background: #fff"],
        .dark .landing-page [style*="background: #EBF4FF"],
        .dark .landing-page [style*="background: #E6F7EE"],
        .dark .landing-page [style*="background: #FFF4EE"],
        .dark .landing-page [style*="background: #FFF9E6"],
        .dark .landing-page [style*="background: #F3EAF9"],
        .dark .landing-page [style*="background: #FFF0E8"] {
          background: #020617 !important;
        }
        .dark .landing-page .service-card,
        .dark .landing-page .doc-card,
        .dark .landing-page .testi-card,
        .dark .landing-page [style*="border: 1.5px solid #E8EDF5"] {
          background: rgba(15, 23, 42, .82) !important;
          border-color: rgba(255,255,255,.08) !important;
        }
        .dark .landing-page [style*="border: 2px solid #E8EDF5"],
        .dark .landing-page [style*="borderTop: 1.5px solid #E8EDF5"] {
          border-color: rgba(255,255,255,.1) !important;
        }
        .dark .landing-page [style*="color: #0D1B2A"],
        .dark .landing-page [style*="color:#0D1B2A"],
        .dark .landing-page [style*="color: #1a1a2e"],
        .dark .landing-page [style*="color: #333"],
        .dark .landing-page [style*="color: #444"] {
          color: #f8fafc !important;
        }
        .dark .landing-page [style*="color: #4A5568"],
        .dark .landing-page [style*="color: #64748B"],
        .dark .landing-page [style*="color: #475569"],
        .dark .landing-page [style*="color: #334155"],
        .dark .landing-page [style*="color: #888"] {
          color: #94a3b8 !important;
        }
        .dark .landing-page .hero-badge,
        .dark .landing-page .section-tag,
        .dark .landing-page .stat-pill {
          background: rgba(79,70,229,.18) !important;
          border-color: rgba(129,140,248,.25) !important;
        }
      `}</style>


      {/* HERO */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY, position: "relative", background: "var(--landing-hero-bg)", padding: "0", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "var(--landing-hero-overlay)", pointerEvents: "none" }} />

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-12 pb-0">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6 }} className="w-full lg:w-1/2 lg:flex-1 pb-6 lg:pb-12">
              <div className="hero-badge" style={{ marginBottom: 20 }}>
                <span className="green-dot" />
                <span>500+ Specialists Available Now</span>
              </div>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 900, color: "var(--landing-heading)", lineHeight: 1.1, marginBottom: 18, fontFamily: "'Syne', sans-serif" }}>
                Your Fastest Path to<br />
                <span className="gradient-text">Complete Recovery</span>
              </h1>
              <p style={{ fontSize: 18, color: "var(--landing-body)", lineHeight: 1.7, marginBottom: 28, maxWidth: 500 }}>
                Expert physiotherapy at home, in-clinic, or online. India&apos;s most trusted rehabilitation platform — used by <strong>2 million+ patients.</strong>
              </p>

              {/* Quick Search */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {["Knee Pain", "Back Pain", "Sports Injury", "Stroke Rehab", "Post Surgery"].map((tag, i) => (
                  <div key={i} style={{ background: "var(--landing-surface)", border: "1.5px solid var(--landing-border)", borderRadius: 100, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "var(--landing-chip-text)", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#0066CC"; (e.target as HTMLElement).style.color = "#0066CC" }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--landing-border)"; (e.target as HTMLElement).style.color = "var(--landing-chip-text)" }}>
                    {tag}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
                <Link href={isLoggedIn ? "/doctors" : "/auth/signup"}>
                  <button style={{ background: "#0066CC", color: "#fff", border: "none", borderRadius: 100, padding: "14px 28px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,102,204,.35)", transition: "all .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                    Book a Specialist <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </Link>
                <Link href="/doctors">
                  <button style={{ background: "var(--landing-surface)", color: "var(--landing-heading)", border: "2px solid var(--landing-border)", borderRadius: 100, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
                    <PlayCircle style={{ width: 18, height: 18, color: "#FF6B35" }} /> How It Works
                  </button>
                </Link>
              </div>

              <div style={{ display: "flex", gap: 28 }}>
                {[{ val: "2M+", lbl: "Patients" }, { val: "500+", lbl: "Specialists" }, { val: "4.9★", lbl: "App Rating" }].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "var(--landing-heading)" }}>{s.val}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--landing-muted)" }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Offers Carousel + Doctor Card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} className="w-full lg:w-1/2 lg:flex-1 flex flex-col gap-4 pb-12 lg:pb-24">
              {/* Offer Card Switcher */}
              <div className="relative h-[200px] sm:h-[170px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeOffer}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: .35 }}
                    className={`offer-card bg-gradient-to-br ${OFFERS[activeOffer].color}`}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "rgba(255,255,255,.12)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, background: "rgba(255,255,255,.08)", borderRadius: "50%" }} />
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <div style={{ display: "inline-block", background: "rgba(255,255,255,.25)", borderRadius: 100, padding: "3px 12px", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{OFFERS[activeOffer].badge}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, opacity: .85, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{OFFERS[activeOffer].tag}</div>
                      <div style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 900, marginBottom: 4 }}>{OFFERS[activeOffer].title}</div>
                      <div style={{ fontSize: 14, opacity: .85 }}>{OFFERS[activeOffer].sub}</div>
                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Claim Offer <ArrowRight style={{ width: 14, height: 14 }} />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div style={{ position: "absolute", bottom: 12, right: 16, display: "flex", gap: 4, zIndex: 10 }}>
                  {OFFERS.map((_, i) => (
                    <div key={i} onClick={() => setActiveOffer(i)} style={{ width: i === activeOffer ? 20 : 6, height: 6, borderRadius: 100, background: i === activeOffer ? "#fff" : "rgba(255,255,255,.4)", cursor: "pointer", transition: "all .3s" }} />
                  ))}
                </div>
              </div>

              {/* Live Consult Widget */}
              <div className="bg-[var(--landing-surface)] rounded-[20px] p-4 sm:p-5 border border-[var(--landing-border)] flex gap-4 items-center">
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#0066CC22,#00A65122)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👩‍⚕️</div>
                  <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, background: "#00A651", borderRadius: "50%", border: "2px solid var(--landing-online-avatar-border)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--landing-heading)" }}>Dr. Priya Sharma is online</div>
                  <div style={{ fontSize: 12, color: "var(--landing-muted)", marginBottom: 8 }}>Sports Physio • 12 yrs exp • ⭐ 4.9</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, background: "#0066CC", color: "#fff", border: "none", borderRadius: 100, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Video Call</button>
                    <button style={{ flex: 1, background: "var(--landing-muted-surface)", color: "var(--landing-button-text)", border: "1.5px solid var(--landing-border)", borderRadius: 100, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Chat Now</button>
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[{ icon: "⏱", label: "Avg Response", val: "< 3 min" }, { icon: "🏥", label: "Cities", val: "200+" }, { icon: "💚", label: "Satisfaction", val: "98%" }].map((s, i) => (
                  <div key={i} className="bg-[var(--landing-surface)] rounded-2xl p-2 sm:p-3.5 border border-[var(--landing-border)] text-center flex flex-col justify-center items-center">
                    <div className="text-lg sm:text-2xl mb-1">{s.icon}</div>
                    <div className="text-xs sm:text-base font-black text-[var(--landing-heading)] whitespace-nowrap">{s.val}</div>
                    <div className="text-[9px] sm:text-[11px] font-bold text-[var(--landing-muted)] mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Specialty Chips Row */}
        <div style={{ background: "var(--landing-surface)", borderTop: "1.5px solid var(--landing-border)", marginTop: 0 }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 24px", display: "flex", gap: 10, overflowX: "auto", alignItems: "center" }} className="scroll-x">
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--landing-muted)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 8 }}>Find by:</span>
            {SPECIALTIES.map((sp, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--landing-muted-surface)", border: "1.5px solid var(--landing-border)", borderRadius: 100, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 700, color: "var(--landing-button-text)", transition: "all .2s", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--landing-hover-surface)"; e.currentTarget.style.borderColor = "#0066CC"; e.currentTarget.style.color = "#0066CC" }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--landing-muted-surface)"; e.currentTarget.style.borderColor = "var(--landing-border)"; e.currentTarget.style.color = "var(--landing-button-text)" }}>
                <span style={{ fontSize: 18 }}>{sp.icon}</span> {sp.label}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* MARQUEE TRUST BAR */}
      <div style={{ background: "#0066CC", padding: "12px 0", overflow: "hidden" }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, ri) =>
            ["✅ NABH Certified Partners", "🚀 Same-Day Appointments Available", "🏥 1500+ Partner Clinics", "💳 EMI Options Available", "🔒 100% Secure Payments", "⭐ 4.9 App Store Rating", "🌍 Pan-India Network", "📱 Download App: 10M+ Downloads"].map((t, i) => (
              <div key={`${ri}-${i}`} style={{ padding: "0 40px", color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", opacity: .9 }}>{t}</div>
            ))
          )}
        </div>
      </div>

      {/* SERVICES SECTION */}
      <section style={{ padding: "64px 24px", maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-tag">Our Services</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#0D1B2A", margin: "0 0 12px", fontFamily: "'Syne', sans-serif" }}>
            Care, Exactly How You Need It
          </h2>
          <p style={{ fontSize: 17, color: "#64748B", maxWidth: 520, margin: "0 auto" }}>
            4 flexible pathways to recovery — choose what works best for you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {SERVICES.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1, duration: .45 }} className="service-card">
              <div style={{ width: 56, height: 56, background: s.bg, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon style={{ width: 26, height: 26, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="stat-pill" style={{ background: s.bg, color: s.color }}>{s.stat}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: s.color, cursor: "pointer" }}>
                  Book <ArrowRight style={{ width: 14, height: 14 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DOCTORS SECTION */}
      <section style={{ padding: "0 24px 64px", maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="section-tag">Top Specialists</div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#0D1B2A", margin: "4px 0 0", fontFamily: "'Syne', sans-serif" }}>
              Consult Our Best Doctors
            </h2>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#EBF4FF", color: "#0066CC", border: "none", borderRadius: 100, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            View All 500+ Doctors <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {DOCTORS.map((doc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} className="doc-card">
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#EBF4FF,#E6F7EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{doc.img}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A" }}>{doc.name}</div>
                    <div className="stat-pill" style={{ background: "#FFF4EE", color: "#FF6B35", fontSize: 10 }}>{doc.tag}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#0066CC", fontWeight: 700, marginTop: 2 }}>{doc.spec}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{doc.exp} experience</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "10px 14px", background: "var(--landing-muted-surface)", border: "1.5px solid var(--landing-border)", borderRadius: 12 }}>
                <span style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, si) => <Star key={si} style={{ width: 12, height: 12, fill: "#FFB800", color: "#FFB800" }} />)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--landing-heading)" }}>{doc.rating}</span>
                <span style={{ fontSize: 12, color: "var(--landing-muted)" }}>({doc.reviews.toLocaleString()} reviews)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--landing-muted)", fontWeight: 600 }}>Starts at </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#00A651" }}>{doc.fee}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "var(--landing-muted-surface)", border: "1.5px solid var(--landing-border)", borderRadius: 100, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--landing-heading)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MessageCircle style={{ width: 12, height: 12 }} /> Chat
                  </button>
                  <button style={{ background: "#0066CC", color: "#fff", border: "none", borderRadius: 100, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS BANNER */}
      <section style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0066CC 60%, #00A651 100%)", padding: "60px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,.06) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,.04) 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center", position: "relative", zIndex: 2 }}>
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: .7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * .1, type: "spring", stiffness: 200 }}>
              <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <s.icon style={{ width: 24, height: 24, color: "#fff" }} />
              </div>
              <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.75)", marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "64px 24px", maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="section-tag">Simple Process</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#0D1B2A", margin: "0 0 12px", fontFamily: "'Syne', sans-serif" }}>
            From Pain to Recovery in 3 Steps
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, position: "relative" }}>
          <div style={{ position: "absolute", top: "30%", left: "16%", right: "16%", height: 2, background: "linear-gradient(90deg, #0066CC, #00A651)", opacity: .2, display: "none" }} className="md:block" />
          {HOW.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .15 }}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-[24px] p-8 text-center relative">
              <div className="absolute top-5 right-6 text-5xl font-black text-slate-100 dark:text-slate-800/40 leading-none select-none font-sans">{h.step}</div>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: `${h.color}18`, border: `2px solid ${h.color}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <h.icon style={{ width: 30, height: 30, color: h.color }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 10 }}>{h.title}</div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{h.desc}</div>
              {i < HOW.length - 1 && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center z-10">
                  <ChevronRight style={{ width: 14, height: 14, color: "#0066CC" }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap" }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ flex: "1 1 400px" }}>
              <div className="section-tag">Why PhysioNow?</div>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: "#0D1B2A", margin: "8px 0 16px", fontFamily: "'Syne', sans-serif" }}>
                India&apos;s Most Trusted<br />Recovery Platform
              </h2>
              <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 28 }}>
                We combine cutting-edge technology with compassionate care to ensure every patient gets the best possible outcome — faster than any traditional approach.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: BadgeCheck, title: "Verified & Certified Specialists", desc: "Every doctor is NABH-verified, background-checked, and peer-reviewed.", color: "#0066CC" },
                  { icon: Shield, title: "Safe & Secure Platform", desc: "End-to-end encrypted consultations. Your data stays private.", color: "#00A651" },
                  { icon: Clock, title: "Same-Day Appointments", desc: "In emergencies, reach a physiotherapist within 3 hours.", color: "#FF6B35" },
                  { icon: RefreshCcw, title: "Free Follow-up Sessions", desc: "Not satisfied? Get a re-consult at absolutely no extra charge.", color: "#9B59B6" },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <f.icon style={{ width: 20, height: 20, color: f.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A", marginBottom: 2 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-auto lg:flex-[1_1_360px] grid grid-cols-2 gap-4">
              {[
                { icon: "🏆", title: "Best Rehab Platform", sub: "HealthTech Awards 2024", colorClass: "bg-[#FFF9E6] dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300" },
                { icon: "📱", title: "Top App Award", sub: "Google Play Store 2024", colorClass: "bg-[#E6F7EE] dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300" },
                { icon: "🌟", title: "ISO 9001 Certified", sub: "Quality Management", colorClass: "bg-[#EBF4FF] dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30 text-blue-800 dark:text-blue-300" },
                { icon: "🤝", title: "50+ Hospital Partners", sub: "Nationwide Network", colorClass: "bg-[#F3EAF9] dark:bg-purple-950/20 border-purple-100/50 dark:border-purple-900/30 text-purple-800 dark:text-purple-300" },
              ].map((a, i) => (
                <motion.div key={i} whileHover={{ scale: 1.04 }} className={`rounded-[20px] p-6 text-center cursor-pointer border transition-all ${a.colorClass}`}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{a.icon}</div>
                  <div className="text-[14px] font-black mb-1 leading-tight">{a.title}</div>
                  <div className="text-[12px] opacity-75 font-semibold">{a.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "64px 24px", background: "#F4F6FB" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="section-tag">Real Stories</div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: "#0D1B2A", margin: "0 0 10px", fontFamily: "'Syne', sans-serif" }}>
              2 Million Patients Can&apos;t Be Wrong
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} className="testi-card">
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {[...Array(t.rating)].map((_, si) => <Star key={si} style={{ width: 16, height: 16, fill: "#FFB800", color: "#FFB800" }} />)}
                </div>
                <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>&quot;{t.text}&quot;</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#0066CC,#00A651)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0D1B2A" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}><MapPin style={{ width: 10, height: 10 }} />{t.loc}</div>
                    </div>
                  </div>
                  <div className="stat-pill" style={{ background: "#EBF4FF", color: "#0066CC", fontSize: 10 }}>
                    <CheckCircle style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />{t.tag}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section style={{ background: "linear-gradient(135deg,#0D1B2A,#0066CC)", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#FFB800", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>📱 Download The App</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", fontFamily: "'Syne', sans-serif" }}>
              Healing in Your Pocket.<br />Anytime, Anywhere.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.75)", maxWidth: 460, lineHeight: 1.7 }}>
              Join 10M+ users. Book appointments, track recovery, chat with doctors — all in one app.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              {["App Store", "Google Play"].map((s, i) => (
                <button key={i} style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,.25)", borderRadius: 14, padding: "12px 22px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.25)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}>
                  <span style={{ fontSize: 22 }}>{i === 0 ? "🍎" : "🤖"}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 10, opacity: .75, fontWeight: 600 }}>Download on the</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{s}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[{ icon: "⭐", val: "4.9/5", lbl: "App Rating" }, { icon: "📥", val: "10M+", lbl: "Downloads" }, { icon: "🏅", val: "#1", lbl: "Health App India" }].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.1)", borderRadius: 20, padding: "24px 28px", textAlign: "center", border: "1.5px solid rgba(255,255,255,.15)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 600, marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "64px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, scale: .95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-[#EBF4FF] to-[#E6F7EE] dark:from-slate-900/60 dark:to-slate-950/60 rounded-[32px] p-6 sm:p-12 text-center border border-[#D0E8FF] dark:border-white/10 relative overflow-hidden">
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "rgba(0,102,204,.06)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, background: "rgba(0,166,81,.06)", borderRadius: "50%" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0D1B2A", marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>
                Start Your Recovery Today
              </h2>
              <p style={{ fontSize: 17, color: "#475569", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>
                Over 2 million patients have found their path to recovery. Your journey begins with one tap.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href={isLoggedIn ? "/doctors" : "/auth/signup"}>
                  <button style={{ background: "#0066CC", color: "#fff", border: "none", borderRadius: 100, padding: "15px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,102,204,.3)", transition: "all .2s" }}>
                    {isLoggedIn ? "Find a Specialist" : "Get Started — It's Free"} <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </Link>
                <Link href="/doctors">
                  <button className="bg-white dark:bg-slate-900 text-[#0D1B2A] dark:text-slate-100 border-2 border-slate-200 dark:border-slate-800 rounded-full py-3.5 px-8 text-base font-bold transition-all">
                    Browse Specialists
                  </button>
                </Link>
              </div>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                {["No credit card required", "Cancel anytime", "NABH Certified Doctors"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B" }}>
                    <CheckCircle style={{ width: 14, height: 14, color: "#00A651" }} /> {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0D1B2A", color: "rgba(255,255,255,.7)", padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0066CC,#00A651)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif" }}>PhysioNow</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>India&apos;s #1 physiotherapy & rehabilitation platform. Connecting patients with expert specialists nationwide.</p>
            </div>
            {[
              { title: "Services", links: ["Online Consultation", "At-Home Physio", "In-Clinic Sessions", "Recovery Kits", "PhysioPass"] },
              { title: "Specialties", links: ["Sports Injury", "Neuro Rehab", "Ortho Physio", "Pain Management", "Geriatric Care"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Partners", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l, li) => (
                    <div key={li} style={{ fontSize: 13, cursor: "pointer", transition: "color .2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "")}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13 }}>© 2025 PhysioNow. All rights reserved. | <span style={{ cursor: "pointer" }}>Privacy Policy</span> | <span style={{ cursor: "pointer" }}>Terms of Service</span> | <Link href="/admin/login" style={{ color: "rgba(255,255,255,.5)", cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>Admin Panel</Link></div>
            <div style={{ display: "flex", gap: 14 }}>
              {["🐦", "📘", "📸", "💼"].map((s, i) => (
                <div key={i} style={{ width: 32, height: 32, background: "rgba(255,255,255,.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, transition: "background .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.1)")}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
