"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import { useUser } from "@/context/UserContext"
import Link from "next/link"
import { Calendar, Clock, Video, Building2, Home as HomeIcon, CheckCircle, XCircle } from "lucide-react"

export default function AppointmentsPage() {
  const { profile, loading } = useUser()
  const [appointments, setAppointments] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const data = await res.json()
          // Sort by newest first
          const sorted = data.sort((a: any, b: any) => new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime())
          setAppointments(sorted)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchAppointments()
  }, [])

  if (loading || fetching) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isPatient = profile?.role === "patient"

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Appointments
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Manage your upcoming and past sessions.
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card className="p-12 rounded-[2rem] text-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No appointments yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isPatient ? "You haven't booked any sessions yet." : "You have no upcoming sessions."}
          </p>
          {isPatient && (
            <Button onClick={() => window.location.href = '/doctors'} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-6">
              Find a Doctor
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appt, i) => {
            const dateObj = new Date(appt.appointment_time)
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            
            const otherParty = isPatient ? appt.doctors : appt.patients
            const name = otherParty?.profiles?.first_name 
              ? `${isPatient ? 'Dr. ' : ''}${otherParty.profiles.first_name} ${otherParty.profiles.last_name || ''}`.trim()
              : 'Unknown User'
            
            let statusColor = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            if (appt.status === "scheduled" || appt.status === "confirmed") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
            if (appt.status === "cancelled" || appt.status === "no-show") statusColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"

            return (
              <motion.div 
                key={appt.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center justify-between group">
                  
                  <div className="flex gap-5 items-center w-full md:w-auto">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800/30 shrink-0">
                      <span className="text-[10px] font-black text-indigo-500 uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 leading-tight">{dateObj.getDate()}</span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{name}</h3>
                        <Badge variant="outline" className={`px-2 py-0 text-[10px] font-bold uppercase rounded-md border ${statusColor}`}>
                          {appt.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {timeStr}
                        </div>
                        <div className="flex items-center gap-1.5 capitalize">
                          {appt.session_type === 'online' && <Video className="w-3.5 h-3.5" />}
                          {appt.session_type === 'in-clinic' && <Building2 className="w-3.5 h-3.5" />}
                          {appt.session_type === 'at-home' && <HomeIcon className="w-3.5 h-3.5" />}
                          {appt.session_type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto flex items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800/60 mt-2 md:mt-0">
                    {(appt.status === "scheduled" || appt.status === "confirmed") && appt.session_type === "online" && (
                      <Link href={`/dashboard/appointments/${appt.id}`} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md shadow-indigo-600/20 gap-1">
                          <Video className="w-4 h-4 mr-1 animate-pulse" /> Join Call
                        </Button>
                      </Link>
                    )}
                    {appt.status === "completed" && (
                      <Button variant="outline" className="w-full md:w-auto rounded-xl font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        View Summary
                      </Button>
                    )}
                  </div>

                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
