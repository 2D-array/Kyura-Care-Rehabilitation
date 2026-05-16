// "use client"

// import Link from "next/link";
// import { ModeToggle } from "./mode-toggle";
// import { Button } from "./ui/button";
// import { Avatar, AvatarFallback } from "./ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { User, Settings, LogOut, LayoutDashboard, Search } from "lucide-react";
// import { useUser } from "@/context/UserContext";
// import { useRouter } from "next/navigation";

// export function Navbar() {
//   const { user, profile, loading, logout } = useUser()
//   const router = useRouter()

//   const getInitials = () => {
//     if (profile?.first_name && profile?.last_name) {
//       return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
//     }
//     if (user?.email) return user.email[0].toUpperCase()
//     return "U"
//   }

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4">
//         <Link href="/" className="flex items-center space-x-2">
//           <span className="text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">CuraReb</span>
//         </Link>
//         <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
//           <Link href="/doctors" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">
//             Find a Specialist
//           </Link>
//           <Link href="/treatments" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">
//             Treatments
//           </Link>
//           <Link href="/#how-it-works" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">
//             How it Works
//           </Link>
//         </nav>
//         <div className="flex items-center space-x-3">
//           <ModeToggle />
//           {!loading && user ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
//                   <Avatar className="h-10 w-10 border-2 border-indigo-500/30">
//                     <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
//                       {getInitials()}
//                     </AvatarFallback>
//                   </Avatar>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-60 rounded-2xl p-2" align="end" forceMount>
//                 <DropdownMenuLabel className="font-normal px-2 py-2">
//                   <div className="flex flex-col space-y-1">
//                     <p className="text-sm font-bold leading-none">
//                       {profile?.first_name || "User"} {profile?.last_name || ""}
//                     </p>
//                     <p className="text-xs leading-none text-muted-foreground capitalize">
//                       {profile?.role || user.email}
//                     </p>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer rounded-xl gap-2">
//                   <LayoutDashboard className="h-4 w-4" />
//                   <span>Dashboard</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer rounded-xl gap-2">
//                   <User className="h-4 w-4" />
//                   <span>My Profile</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => router.push("/doctors")} className="cursor-pointer rounded-xl gap-2">
//                   <Search className="h-4 w-4" />
//                   <span>Find Doctors</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => router.push("/dashboard/profile?tab=settings")} className="cursor-pointer rounded-xl gap-2">
//                   <Settings className="h-4 w-4" />
//                   <span>Settings</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
//                   <LogOut className="h-4 w-4" />
//                   <span>Log out</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : !loading ? (
//             <>
//               <Link href="/auth/login">
//                 <Button variant="ghost" className="hidden sm:inline-flex text-foreground/80 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
//                   Log In
//                 </Button>
//               </Link>
//               <Link href="/auth/signup">
//                 <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold px-6 shadow-md hover:shadow-lg transition-all">
//                   Register
//                 </Button>
//               </Link>
//             </>
//           ) : null}
//         </div>
//       </div>
//     </header>
//   )
// }
"use client"

import { useEffect, useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  User, Settings, LogOut, LayoutDashboard, Search,
  Activity, ShoppingCart, Bell, ChevronDown, ArrowRight,
  X, Menu, BadgeCheck, Heart, Video, Home as HomeIcon,
  Stethoscope, ChevronRight
} from "lucide-react"
import { useUser } from "@/context/UserContext"

/* ─────────────────── constants ─────────────────── */
const SPECIALTIES = [
  { icon: "🦴", label: "Ortho Physio", href: "/doctors?spec=ortho" },
  { icon: "🧠", label: "Neuro Rehab", href: "/doctors?spec=neuro" },
  { icon: "❤️", label: "Cardiac Rehab", href: "/doctors?spec=cardiac" },
  { icon: "🏃", label: "Sports Injury", href: "/doctors?spec=sports" },
  { icon: "💊", label: "Pain Mgmt", href: "/doctors?spec=pain" },
  { icon: "🤰", label: "Pre/Post Natal", href: "/doctors?spec=natal" },
  { icon: "👴", label: "Geriatric", href: "/doctors?spec=geriatric" },
  { icon: "🧘", label: "Yoga Therapy", href: "/doctors?spec=yoga" },
]

const SEARCH_SUGGESTIONS = [
  "Knee pain physiotherapy",
  "Sports injury rehab",
  "Back pain specialist",
  "Shoulder dislocation",
  "Post-surgery recovery",
]

const NAV_LINKS = [
  { label: "Find Specialist", href: "/doctors" },
  { label: "Treatments", href: "/treatments" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Offers", href: "/offers" },
]

/* ─────────────────── component ─────────────────── */
export function Navbar() {
  const { user, profile, loading, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(2)
  const [subNavActive, setSubNavActive] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  /* focus search input when panel opens */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80)
  }, [searchOpen])

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name)
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return "U"
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0])

  /* ── render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');

        .pn-nav *   { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .pn-navlink { font-size:13px; font-weight:700; color:#334155; transition:color .18s; cursor:pointer; white-space:nowrap; text-decoration:none; padding:4px 0; border-bottom:2px solid transparent; }
        .pn-navlink:hover, .pn-navlink.active { color:#0066CC; border-bottom-color:#0066CC; }
        .pn-pill    { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;border:none;text-decoration:none; }
        .pn-icon-btn{ width:38px;height:38px;border-radius:50%;background:#F4F6FB;border:1.5px solid #E8EDF5;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;position:relative; }
        .pn-icon-btn:hover { background:#EBF4FF; border-color:#0066CC; }
        .pn-subnav-chip { display:flex;align-items:center;gap:6px;padding:7px 14px;cursor:pointer;white-space:nowrap;font-size:13px;font-weight:700;color:#475569;border-bottom:2px solid transparent;transition:all .18s;text-decoration:none; }
        .pn-subnav-chip:hover { color:#0066CC; border-bottom-color:#0066CC; }
        .pn-subnav-chip.active { color:#0066CC; border-bottom-color:#0066CC; }
        .pn-search-sug { display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .14s; font-size:14px; font-weight:500; color:#1a1a2e; }
        .pn-search-sug:hover { background:#F0F7FF; }
        .pn-dd-item { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;color:#334155;transition:background .14s;text-decoration:none; }
        .pn-dd-item:hover { background:#F0F7FF; color:#0066CC; }
        .pn-dd-item.danger { color:#DC2626; }
        .pn-dd-item.danger:hover { background:#FEF2F2; color:#DC2626; }
        .pn-badge { position:absolute;top:-4px;right:-4px;background:#FF6B35;color:#fff;border-radius:100px;width:16px;height:16px;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff; }
        .pn-live-dot { width:8px;height:8px;background:#00A651;border-radius:50%;display:inline-block;margin-right:5px;flex-shrink:0; }
        .pn-mobile-link { display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F1F5F9;font-size:16px;font-weight:700;color:#1a1a2e;text-decoration:none;cursor:pointer; }
        .pn-mobile-link:hover { color:#0066CC; }
        @keyframes pn-slide-down { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .pn-dropdown-anim { animation: pn-slide-down .2s ease; }
        .pn-search-overlay { position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:200;backdrop-filter:blur(4px); }
        .pn-search-panel { position:fixed;top:0;left:0;right:0;background:#fff;z-index:201;border-bottom:2px solid #E8EDF5;box-shadow:0 20px 60px rgba(0,0,0,.12); }
      `}</style>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div style={{ background: "#0066CC", color: "#fff", padding: "7px 0", fontSize: 12, fontWeight: 700, textAlign: "center", letterSpacing: ".01em", zIndex: 110, position: "relative" }}>
        🎉 New user? First consultation FREE —{" "}
        <Link href="/auth/signup" style={{ color: "#FFD700", textDecoration: "underline" }}>Claim Now</Link>
        &nbsp;|&nbsp; 🚚 Free delivery on recovery kits above ₹499
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header
        className="pn-nav"
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,.97)",
          borderBottom: "1.5px solid #E8EDF5",
          backdropFilter: "blur(14px)",
          transition: "box-shadow .25s",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,.09)" : "none",
        }}
      >
        {/* ── ROW 1: Logo | Search | Actions ── */}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0066CC,#00A651)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#0066CC", lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>PhysioNow</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#00A651", letterSpacing: ".07em" }}>REHAB PLATFORM</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 8 }} className="hidden md:flex">
            {NAV_LINKS.map((l, i) => (
              <Link key={i} href={l.href} className={`pn-navlink${isActive(l.href) ? " active" : ""}`}>{l.label}</Link>
            ))}
          </nav>

          {/* Search bar — desktop */}
          <div
            onClick={() => setSearchOpen(true)}
            style={{ flex: 1, maxWidth: 460, background: "#F4F6FB", border: "1.5px solid #E8EDF5", borderRadius: 100, padding: "0 16px", height: 42, display: "flex", alignItems: "center", gap: 10, cursor: "text", transition: "all .18s" }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor = "#0066CC"); (e.currentTarget.style.background = "#EBF4FF") }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = "#E8EDF5"); (e.currentTarget.style.background = "#F4F6FB") }}
            className="hidden md:flex"
          >
            <Search style={{ width: 15, height: 15, color: "#94A3B8", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>Search doctors, conditions, specialties…</span>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>

            {/* Mobile search */}
            <button className="pn-icon-btn md:hidden" onClick={() => setSearchOpen(true)}>
              <Search style={{ width: 16, height: 16, color: "#334155" }} />
            </button>

            {/* Cart */}
            <div className="pn-icon-btn" style={{ display: "none" }} /* show if you have cart page */>
              <ShoppingCart style={{ width: 16, height: 16, color: "#334155" }} />
              {cartCount > 0 && <div className="pn-badge">{cartCount}</div>}
            </div>

            {/* Notifications (logged-in only) */}
            {user && (
              <div className="pn-icon-btn">
                <Bell style={{ width: 16, height: 16, color: "#334155" }} />
                <div className="pn-badge" style={{ width: 8, height: 8, top: 2, right: 2 }} />
              </div>
            )}

            {/* Dark mode toggle */}
            <ModeToggle />

            {/* ── AUTH SECTION ── */}
            {!loading && user ? (
              /* ── Logged in: avatar dropdown ── */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8, borderRadius: 100, padding: "4px 10px 4px 4px", transition: "background .18s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F4F6FB")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#0066CC,#00A651)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, border: "2px solid #E8EDF5" }}>
                      {getInitials()}
                    </div>
                    <div className="hidden md:block" style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0D1B2A", lineHeight: 1.2 }}>
                        {profile?.first_name || "User"}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", lineHeight: 1.2, textTransform: "capitalize" }}>
                        {profile?.role || "Patient"}
                      </div>
                    </div>
                    <ChevronDown style={{ width: 14, height: 14, color: "#94A3B8" }} className="hidden md:block" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  style={{ width: 240, borderRadius: 20, border: "1.5px solid #E8EDF5", boxShadow: "0 20px 60px rgba(0,0,0,.12)", padding: 8, background: "#fff" }}
                  className="pn-dropdown-anim"
                  forceMount
                >
                  {/* User info header */}
                  <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid #F1F5F9", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#0066CC,#00A651)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                        {getInitials()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0D1B2A" }}>
                          {profile?.first_name || "User"} {profile?.last_name || ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <span className="pn-live-dot" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => router.push("/dashboard")} className="pn-dd-item">
                    <LayoutDashboard style={{ width: 15, height: 15 }} /> Dashboard
                  </div>
                  <div onClick={() => router.push("/dashboard/profile")} className="pn-dd-item">
                    <User style={{ width: 15, height: 15 }} /> My Profile
                  </div>
                  <div onClick={() => router.push("/doctors")} className="pn-dd-item">
                    <Stethoscope style={{ width: 15, height: 15 }} /> Find Doctors
                  </div>
                  <div onClick={() => router.push("/dashboard/profile?tab=settings")} className="pn-dd-item">
                    <Settings style={{ width: 15, height: 15 }} /> Settings
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", margin: "6px 0" }} />

                  <div onClick={logout} className="pn-dd-item danger">
                    <LogOut style={{ width: 15, height: 15 }} /> Log out
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

            ) : !loading ? (
              /* ── Logged out: Login + Register ── */
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link href="/auth/login" className="pn-pill hidden sm:inline-flex" style={{ background: "#F4F6FB", color: "#334155", border: "1.5px solid #E8EDF5" }}>
                  Log In
                </Link>
                <Link href="/auth/signup" className="pn-pill" style={{ background: "#0066CC", color: "#fff", boxShadow: "0 4px 14px rgba(0,102,204,.3)" }}>
                  Register Free
                </Link>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button className="pn-icon-btn md:hidden" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen
                ? <X style={{ width: 16, height: 16, color: "#334155" }} />
                : <Menu style={{ width: 16, height: 16, color: "#334155" }} />}
            </button>
          </div>
        </div>

        {/* ── ROW 2: Sub-nav specialty chips ── */}
        <div style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFF" }} className="hidden md:block">
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
            {SPECIALTIES.map((s, i) => (
              <Link key={i} href={s.href} className={`pn-subnav-chip${subNavActive === i ? " active" : ""}`}
                onClick={() => setSubNavActive(i)}>
                <span style={{ fontSize: 16 }}>{s.icon}</span> {s.label}
              </Link>
            ))}
            <Link href="/doctors" className="pn-subnav-chip" style={{ marginLeft: "auto", color: "#0066CC", fontWeight: 800 }}>
              View All <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── SEARCH OVERLAY ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              className="pn-search-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              className="pn-search-panel pn-nav"
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              {/* Search input row */}
              <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <Search style={{ width: 20, height: 20, color: "#0066CC", flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && searchVal) { router.push(`/doctors?q=${encodeURIComponent(searchVal)}`); setSearchOpen(false) } }}
                  placeholder="Search doctors, conditions, specialties…"
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 18, fontWeight: 600, color: "#0D1B2A", background: "transparent", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                />
                {searchVal && (
                  <button onClick={() => setSearchVal("")} style={{ background: "#F4F6FB", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X style={{ width: 14, height: 14, color: "#64748B" }} />
                  </button>
                )}
                <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#64748B", padding: "6px 12px", borderRadius: 8 }}>
                  Cancel
                </button>
              </div>

              <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid #F1F5F9" }}>
                {/* Suggestions */}
                <div>
                  <div style={{ padding: "10px 16px 4px", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em" }}>Popular Searches</div>
                  {SEARCH_SUGGESTIONS.map((s, i) => (
                    <div key={i} className="pn-search-sug" onClick={() => { router.push(`/doctors?q=${encodeURIComponent(s)}`); setSearchOpen(false) }}>
                      <Search style={{ width: 13, height: 13, color: "#0066CC", flexShrink: 0 }} />
                      {s}
                    </div>
                  ))}
                </div>
                {/* Specialty quick picks */}
                <div style={{ borderLeft: "1px solid #F1F5F9" }}>
                  <div style={{ padding: "10px 16px 4px", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em" }}>Browse by Specialty</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 16px" }}>
                    {SPECIALTIES.map((sp, i) => (
                      <Link key={i} href={sp.href} onClick={() => setSearchOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "#F4F6FB", border: "1.5px solid #E8EDF5", borderRadius: 100, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#334155", textDecoration: "none", transition: "all .15s" }}
                        onMouseEnter={e => { (e.currentTarget.style.background = "#EBF4FF"); (e.currentTarget.style.borderColor = "#0066CC"); (e.currentTarget.style.color = "#0066CC") }}
                        onMouseLeave={e => { (e.currentTarget.style.background = "#F4F6FB"); (e.currentTarget.style.borderColor = "#E8EDF5"); (e.currentTarget.style.color = "#334155") }}>
                        <span style={{ fontSize: 16 }}>{sp.icon}</span> {sp.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 98 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="pn-nav"
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(340px,90vw)", background: "#fff", zIndex: 99, padding: "80px 24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              {/* User card (if logged in) */}
              {user && (
                <div style={{ background: "linear-gradient(135deg,#EBF4FF,#E6F7EE)", borderRadius: 20, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0066CC,#00A651)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18 }}>
                    {getInitials()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A" }}>{profile?.first_name || "User"} {profile?.last_name || ""}</div>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "capitalize" }}>{profile?.role || user.email}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              {NAV_LINKS.map((l, i) => (
                <Link key={i} href={l.href} className="pn-mobile-link">
                  {l.label} <ChevronRight style={{ width: 16, height: 16, color: "#94A3B8" }} />
                </Link>
              ))}

              {/* Specialties */}
              <div style={{ margin: "16px 0 8px", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em" }}>Specialties</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {SPECIALTIES.map((sp, i) => (
                  <Link key={i} href={sp.href} onClick={() => setMobileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#F4F6FB", borderRadius: 100, padding: "7px 13px", fontSize: 13, fontWeight: 700, color: "#334155", textDecoration: "none" }}>
                    <span style={{ fontSize: 15 }}>{sp.icon}</span> {sp.label}
                  </Link>
                ))}
              </div>

              {/* Auth actions */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {user ? (
                  <>
                    <button onClick={() => { router.push("/dashboard"); setMobileOpen(false) }}
                      style={{ background: "#F4F6FB", border: "1.5px solid #E8EDF5", borderRadius: 100, padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <LayoutDashboard style={{ width: 16, height: 16 }} /> Dashboard
                    </button>
                    <button onClick={() => { logout(); setMobileOpen(false) }}
                      style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 100, padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <LogOut style={{ width: 16, height: 16 }} /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                      style={{ background: "#F4F6FB", border: "1.5px solid #E8EDF5", borderRadius: 100, padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#334155", textAlign: "center", textDecoration: "none", display: "block" }}>
                      Log In
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)}
                      style={{ background: "#0066CC", borderRadius: 100, padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", textDecoration: "none", display: "block", boxShadow: "0 4px 14px rgba(0,102,204,.3)" }}>
                      Register Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}