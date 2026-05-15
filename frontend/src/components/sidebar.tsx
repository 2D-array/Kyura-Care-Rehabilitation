"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Activity } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Sessions", icon: Calendar, href: "/dashboard/sessions" },
  { label: "Records", icon: FileText, href: "/dashboard/records" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <div className="h-full border-r border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 backdrop-blur-xl flex flex-col pt-6 pb-4 shadow-sm">
      <Link href="/" className="px-6 mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 group cursor-pointer">
        <Activity className="w-8 h-8 group-hover:scale-105 transition-transform" />
        <span className="text-2xl font-black tracking-tighter">CuraReb</span>
      </Link>
      <div className="flex-1 px-4 space-y-2">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${pathname === route.href ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}>
            <route.icon className="w-5 h-5" />
            <span>{route.label}</span>
          </Link>
        ))}
      </div>
      <div className="px-6 flex items-center justify-between border-t border-slate-200/60 dark:border-white/5 pt-4">
        <ModeToggle />
        <button className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
