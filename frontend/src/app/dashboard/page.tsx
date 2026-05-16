"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecoveryChart } from "@/components/dashboard-charts"
import { Activity, Calendar as CalendarIcon, Video, CheckCircle, Clock, AlertCircle, ArrowRight, Search } from "lucide-react"
import { useUser } from "@/context/UserContext"
import Link from "next/link"

export default function DashboardPage() {
  const { profile, loading } = useUser()
  const [appointments, setAppointments] = useState<any[]>([])

  const isProfileComplete = profile?.role === "patient"
    ? !!(profile?.first_name && profile?.phone_number && profile?.date_of_birth)
    : !!(profile?.first_name && profile?.specialty && profile?.bio)

  if (loading) return null

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {profile?.first_name || "there"} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {profile?.role === "doctor" ? "Here's your practice overview." : "Here's your recovery progress."}
          </p>
        </div>
        <Link href="/doctors">
          <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg">
            <Search className="w-4 h-4" />Find Doctors
          </Button>
        </Link>
      </div>

      {/* Profile Incomplete Banner */}
      {profile && !isProfileComplete && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50">
          <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">Your profile is incomplete</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Complete your profile to get the best experience.</p>
          </div>
          <Link href="/dashboard/profile">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 shrink-0">
              Complete Profile <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 auto-rows-min">

        {/* Chart */}
        <Card className="md:col-span-3 row-span-2 p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/60 dark:border-white/5 shadow-lg transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recovery Progress</h2>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" /> +15% this week
            </div>
          </div>
          <RecoveryChart />
        </Card>

        {/* Sessions Stat */}
        <Card className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] flex flex-col justify-between transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-black tracking-tighter mb-1">12</div>
            <div className="text-indigo-100 font-medium text-sm">Sessions Completed</div>
          </div>
        </Card>

        {/* Days to Recovery */}
        <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg flex flex-col justify-between transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-black tracking-tighter mb-1 text-slate-900 dark:text-white">24</div>
            <div className="text-slate-500 font-medium text-sm">Days to Full Recovery</div>
          </div>
        </Card>

        {/* Next Appointment */}
        <Card className="md:col-span-2 p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg group">
          <h3 className="text-base font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Next Appointment</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-950/50">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg shrink-0">SC</div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dr. Sarah Chen</h4>
              <p className="text-xs font-medium text-slate-500">Neuro Rehabilitation • Online</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-2 py-0.5 rounded-md mx-auto sm:mx-0">
                <CalendarIcon className="w-3 h-3" /> Today, 2:00 PM
              </div>
            </div>
            <Button className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg font-bold px-5 h-10 text-sm">
              <Video className="w-3 h-3 mr-1.5" /> Join
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-2 p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
          <h3 className="text-base font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/doctors">
              <Button variant="outline" className="w-full h-16 rounded-2xl flex flex-col gap-1 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-xs font-bold">
                <Search className="w-4 h-4 text-indigo-600" />Find Doctor
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full h-16 rounded-2xl flex flex-col gap-1 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-xs font-bold">
                <Activity className="w-4 h-4 text-purple-600" />My Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
