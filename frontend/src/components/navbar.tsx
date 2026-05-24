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
  { label: "PhysioPass", href: "/plans" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Offers", href: "/offers" },
]

/* ─────────────────── component ─────────────────── */
export function Navbar() {
  const { user, profile, loading, logout, session } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const [notifications, setNotifications] = useState<any[]>([])

  const fetchNotifications = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find(n => n.id === id)
    if (!target || target.is_read) return

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))

    if (!session?.access_token) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
    } catch (e) {
      console.error("Failed to mark notification as read:", e)
    }
  }

  useEffect(() => {
    if (session) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
    }
  }, [session])

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
  useEffect(() => {
    const id = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(id)
  }, [pathname])

  const unreadCount = notifications.filter(n => !n.is_read).length
  const firstName = profile?.first_name || user?.user_metadata?.first_name || "User"
  const lastName = profile?.last_name || user?.user_metadata?.last_name || ""
  const userRole = profile?.role || user?.user_metadata?.role || "Patient"

  const getInitials = () => {
    if (firstName !== "User" && lastName !== "")
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    if (firstName !== "User")
      return firstName[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return "U"
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0])

  /* ── render ── */
  return (
    <>
      <div className="sticky top-0 z-[100] flex flex-col w-full">
        {/* ── TOP ANNOUNCEMENT BAR ── */}
        <div className="bg-indigo-600 text-white py-1.5 text-xs font-bold text-center tracking-wide z-[110] relative">
          🎉 New user? First consultation FREE —{" "}
          <Link href="/auth/signup" className="text-yellow-400 underline decoration-yellow-400/50 hover:decoration-yellow-400 transition-colors">Claim Now</Link>
          &nbsp;|&nbsp; 🚚 Free delivery on recovery kits above ₹499
        </div>

        {/* ── MAIN NAVBAR ── */}
        <header
          className={`w-full border-b transition-all duration-250 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800 ${
            scrolled ? "shadow-md shadow-black/5 dark:shadow-black/20" : ""
          }`}
        >
          {/* ── ROW 1: Logo | Search | Actions ── */}
          <div className="max-w-[1320px] mx-auto px-5 flex items-center gap-4 h-16">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <Activity className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[17px] font-black text-indigo-600 dark:text-indigo-400 leading-none tracking-tight font-sans">PhysioNow</div>
                <div className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-500 tracking-widest mt-0.5">REHAB PLATFORM</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6 ml-4">
              {NAV_LINKS.map((l, i) => (
                <Link 
                  key={i} 
                  href={l.href} 
                  className={`text-[13px] font-bold py-1 whitespace-nowrap border-b-2 transition-colors ${
                    isActive(l.href) 
                      ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400" 
                      : "text-slate-700 dark:text-slate-300 border-transparent hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-400"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Search bar — desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex flex-1 max-w-[460px] bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 rounded-full px-4 h-10 items-center gap-2.5 text-left transition-colors hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 group"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
              <span className="text-[13px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">Search doctors, conditions, specialties…</span>
            </button>

            {/* Right actions */}
            <div className="flex items-center gap-2.5 ml-auto">
              
              {/* Mobile search */}
              <button 
                className="md:hidden w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:border-indigo-600 dark:hover:border-indigo-500"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>

              {/* Notifications (logged-in only) */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:border-indigo-600 dark:hover:border-indigo-500 focus:outline-none">
                      <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-80 max-h-[420px] overflow-y-auto rounded-2xl border-1.5 border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5 dark:shadow-black/40 p-2 bg-white dark:bg-slate-950 z-[200] animate-in slide-in-from-top-2 duration-150"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">In-App Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-extrabold px-2.5 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-500">All caught up!</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">No new notifications.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleMarkAsRead(notif.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-colors relative flex flex-col gap-1 ${
                              notif.is_read
                                ? "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                : "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30"
                            }`}
                          >
                            {!notif.is_read && (
                              <span className="absolute top-4 right-3 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                            )}
                            <div className="text-xs font-black text-slate-900 dark:text-white pr-4">
                              {notif.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                              {notif.content}
                            </div>
                            <div className="text-[9px] text-slate-400 font-semibold mt-1">
                              {new Date(notif.created_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Dark mode toggle */}
              <ModeToggle />

              {/* ── AUTH SECTION ── */}
              {!loading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-sm border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                        {getInitials()}
                      </div>
                      <div className="hidden md:flex flex-col items-start text-left">
                        <div className="text-[13px] font-black text-slate-900 dark:text-white leading-[1.2]">
                          {firstName}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-[1.2] capitalize">
                          {userRole}
                        </div>
                      </div>
                      <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-60 rounded-2xl border-1.5 border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5 dark:shadow-black/40 p-2 bg-white dark:bg-slate-950 animate-in slide-in-from-top-2 z-[200]"
                    forceMount
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-base shadow-sm">
                          {getInitials()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {firstName} {lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem onClick={() => router.push("/dashboard")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(profile?.role === "doctor" ? "/dashboard/patients" : "/doctors")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Stethoscope className="w-4 h-4" /> {profile?.role === "doctor" ? "My Patients" : "Find Doctors"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile?tab=settings")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800/60" />

                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <LogOut className="w-4 h-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              ) : !loading ? (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Log In
                  </Link>
                  <Link href="/auth/signup" className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 transition-all">
                    Register Free
                  </Link>
                </div>
              ) : null}

              {/* Mobile hamburger */}
              <button 
                className="md:hidden w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileOpen(o => !o)}
              >
                {mobileOpen ? <X className="w-4 h-4 text-slate-700 dark:text-slate-300" /> : <Menu className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
              </button>
            </div>
          </div>

          {/* ── ROW 2: Sub-nav specialty chips ── */}
          <div className="hidden md:block border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="max-w-[1320px] mx-auto px-5 flex overflow-x-auto no-scrollbar">
              {SPECIALTIES.map((s, i) => (
                <Link 
                  key={i} 
                  href={s.href} 
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 whitespace-nowrap text-[13px] font-bold border-b-2 transition-colors ${
                    subNavActive === i 
                      ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400" 
                      : "text-slate-600 dark:text-slate-400 border-transparent hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-400"
                  }`}
                  onClick={() => setSubNavActive(i)}
                >
                  <span className="text-[15px]">{s.icon}</span> {s.label}
                </Link>
              ))}
              <Link href="/doctors" className="flex items-center gap-1.5 px-3.5 py-1.5 ml-auto whitespace-nowrap text-[13px] font-black text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* ── SEARCH OVERLAY ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-950 z-[201] border-b-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10 dark:shadow-black/40"
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              {/* Search input row */}
              <div className="max-w-[1320px] mx-auto px-5 py-4 flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && searchVal) { router.push(`/doctors?q=${encodeURIComponent(searchVal)}`); setSearchOpen(false) } }}
                  placeholder="Search doctors, conditions, specialties…"
                  className="flex-1 border-none outline-none text-lg font-semibold text-slate-900 dark:text-white bg-transparent placeholder-slate-400 dark:placeholder-slate-600"
                />
                {searchVal && (
                  <button 
                    onClick={() => setSearchVal("")} 
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </button>
                )}
                <button 
                  onClick={() => setSearchOpen(false)} 
                  className="px-3 py-1.5 text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="max-w-[1320px] mx-auto px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-100 dark:border-slate-800/60">
                {/* Suggestions */}
                <div className="py-2">
                  <div className="px-4 py-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Popular Searches</div>
                  {SEARCH_SUGGESTIONS.map((s, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl mx-2"
                      onClick={() => { router.push(`/doctors?q=${encodeURIComponent(s)}`); setSearchOpen(false) }}
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
                {/* Specialty quick picks */}
                <div className="py-2 md:border-l border-slate-100 dark:border-slate-800/60">
                  <div className="px-4 py-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Browse by Specialty</div>
                  <div className="flex flex-wrap gap-2 px-4 py-2">
                    {SPECIALTIES.map((sp, i) => (
                      <Link 
                        key={i} 
                        href={sp.href} 
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span className="text-[15px]">{sp.icon}</span> {sp.label}
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
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[min(340px,90vw)] bg-white dark:bg-slate-950 z-[151] pt-20 px-6 pb-8 overflow-y-auto flex flex-col shadow-2xl"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              {/* Close Button inside drawer */}
              <button 
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* User card (if logged in) */}
              {user && (
                <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-emerald-50 dark:to-emerald-900/20 rounded-2xl p-4 mb-5 flex items-center gap-3.5 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {getInitials()}
                  </div>
                  <div>
                    <div className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">{profile?.first_name || "User"} {profile?.last_name || ""}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold capitalize mt-0.5">{profile?.role || user.email}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <Link 
                    key={i} 
                    href={l.href} 
                    className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800/60 text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label} <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>

              {/* Specialties */}
              <div className="mt-6 mb-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Specialties</div>
              <div className="flex flex-wrap gap-2 mb-8">
                {SPECIALTIES.map((sp, i) => (
                  <Link 
                    key={i} 
                    href={sp.href} 
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-[13px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  >
                    <span className="text-[15px]">{sp.icon}</span> {sp.label}
                  </Link>
                ))}
              </div>

              {/* Auth actions */}
              <div className="mt-auto flex flex-col gap-2.5">
                {user ? (
                  <>
                    <button 
                      onClick={() => { router.push("/dashboard"); setMobileOpen(false) }}
                      className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 rounded-full py-3 px-5 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button 
                      onClick={() => { logout(); setMobileOpen(false) }}
                      className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border-1.5 border-red-200 dark:border-red-900/50 rounded-full py-3 px-5 text-sm font-bold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-1.5 border-slate-200 dark:border-slate-800 rounded-full py-3 px-5 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center bg-indigo-600 rounded-full py-3 px-5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
                    >
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
