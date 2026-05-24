"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Calendar, Clock, FileText, HeartPulse, UserRound } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/context/UserContext"

type Appointment = {
  id: string
  appointment_time: string
  session_type?: string
  status?: string
}

type DoctorPatient = {
  id: string
  profile?: {
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string
  }
  patient?: {
    primary_injury?: string
    medical_history?: string
    allergies?: string
    current_medications?: string
    chronic_conditions?: string
  }
  appointments: Appointment[]
}

export default function MyPatientsPage() {
  const { profile, loading } = useUser()
  const [patients, setPatients] = useState<DoctorPatient[]>([])
  const [fetching, setFetching] = useState(true)
  const isDoctor = profile?.role === "doctor"

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/api/v1/patients/doctor/my-patients`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })

        if (res.ok) {
          setPatients(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    if (isDoctor) {
      fetchPatients()
    }
  }, [isDoctor])

  if (loading || (isDoctor && fetching)) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isDoctor) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="p-10 rounded-[2rem] text-center bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
          <p className="font-bold text-slate-700 dark:text-slate-300">This section is available for doctors.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Patients
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Review booked patients, appointment history, and medical context.
        </p>
      </div>

      {patients.length === 0 ? (
        <Card className="p-12 rounded-[2rem] text-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
          <UserRound className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No patients yet</h3>
          <p className="text-slate-500 dark:text-slate-400">Booked patients will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-5">
          {patients.map((item) => {
            const patient = item.patient || {}
            const patientProfile = item.profile || {}
            const fullName = `${patientProfile.first_name || "Patient"} ${patientProfile.last_name || ""}`.trim()
            const latestAppointment = item.appointments[0]

            return (
              <Card key={item.id} className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-64 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-white font-black flex items-center justify-center text-lg">
                        {patientProfile.first_name?.[0] || "P"}{patientProfile.last_name?.[0] || ""}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">{fullName}</h2>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{patientProfile.email || "No email"}</p>
                      </div>
                    </div>
                    {latestAppointment && (
                      <div className="mt-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          <Calendar className="w-3.5 h-3.5" />
                          Latest appointment
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {new Date(latestAppointment.appointment_time).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 p-4">
                      <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white mb-3">
                        <HeartPulse className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Medical Info
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Injury:</span> {patient.primary_injury || "Not provided"}</p>
                        <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">History:</span> {patient.medical_history || "Not provided"}</p>
                        <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Allergies:</span> {patient.allergies || "Not provided"}</p>
                        <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Medications:</span> {patient.current_medications || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 p-4">
                      <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white mb-3">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Appointment History
                      </div>
                      <div className="space-y-2">
                        {item.appointments.slice(0, 4).map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {new Date(appointment.appointment_time).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <Badge variant="outline" className="capitalize rounded-lg text-[10px] font-bold">
                              {appointment.status || "scheduled"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
