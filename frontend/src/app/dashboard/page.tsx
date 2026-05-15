"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecoveryChart } from "@/components/dashboard-charts"
import { Activity, Calendar as CalendarIcon, Video, CheckCircle, Clock } from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data from FastAPI backend
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments`)
        if (!res.ok) throw new Error("Not authorized")
        const json = await res.json()
        setData(json)
      } catch (e) {
        // Fallback to mock data for demo purposes to preserve UI
        setData({ mock: true })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return null; // handled by loading.tsx

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back. Here's your recovery progress.</p>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
        
        {/* Main Chart (Spans 3 cols) */}
        <Card className="md:col-span-3 row-span-2 p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recovery Progress</h2>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <Activity className="w-3 h-3" /> +15% this week
            </div>
          </div>
          <RecoveryChart />
        </Card>

        {/* Stat Widgets */}
        <Card className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] flex flex-col justify-between transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-5xl font-black tracking-tighter mb-1">12</div>
            <div className="text-indigo-100 font-medium text-sm">Sessions Completed</div>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-5xl font-black tracking-tighter mb-1 text-slate-900 dark:text-white">24</div>
            <div className="text-slate-500 font-medium text-sm">Days to Full Recovery</div>
          </div>
        </Card>

        {/* Upcoming Session */}
        <Card className="md:col-span-2 p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <h3 className="text-lg font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Next Appointment</h3>
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-950/50">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shrink-0 shadow-inner">
              SC
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">Dr. Sarah Chen</h4>
              <p className="text-sm font-medium text-slate-500">Neuro Rehabilitation • Online Session</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-2 py-1 rounded-md mx-auto sm:mx-0">
                <CalendarIcon className="w-3.5 h-3.5" /> Today, 2:00 PM
              </div>
            </div>
            <Button className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-pulse hover:animate-none font-bold px-6 h-12">
              <Video className="w-4 h-4 mr-2" /> Join Video
            </Button>
          </div>
        </Card>

      </div>
    </div>
  )
}
