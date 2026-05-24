"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Search, User, LogOut, Activity, ShieldCheck, Users } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { useUser } from "@/context/UserContext"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Find Doctors", icon: Search, href: "/doctors" },
  { label: "Appointments", icon: Calendar, href: "/dashboard/sessions" },
  { label: "PhysioPass", icon: ShieldCheck, href: "/plans" },
]

const doctorRoutes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "My Patients", icon: Users, href: "/dashboard/patients" },
  { label: "Appointments", icon: Calendar, href: "/dashboard/sessions" },
  { label: "Availability", icon: Calendar, href: "/dashboard/availability" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, user, logout } = useUser()

  let navRoutes = profile?.role === "doctor" ? doctorRoutes : routes
  if (profile?.role === "admin") {
    navRoutes = [
      ...routes,
      { label: "Admin Panel", icon: ShieldCheck, href: "/admin" }
    ]
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (user?.email) return user.email[0].toUpperCase()
    return "U"
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User"

  return (
    <div className="h-full border-r border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 backdrop-blur-xl flex flex-col pt-6 pb-4 shadow-sm">
      {/* Logo */}
      <Link href="/" className="px-6 mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 group cursor-pointer">
        <Activity className="w-7 h-7 group-hover:scale-105 transition-transform" />
        <span className="text-xl font-black tracking-tighter">CuraReb</span>
      </Link>

      {/* User Card */}
      <div className="mx-4 mb-6 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-indigo-200 dark:border-indigo-700">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{displayName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge className="text-[10px] px-1.5 py-0 capitalize bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
                {profile?.role || "member"}
              </Badge>
              {profile?.role === "doctor" && profile?.is_verified && (
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navRoutes.map((route) => {
          const isActive = pathname === route.href
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <route.icon className="w-4 h-4 shrink-0" />
              <span>{route.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pt-4 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
        <ModeToggle />
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  )
}
