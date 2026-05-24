"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, ShieldAlert, Users, Award, TrendingUp, Sparkles, Check, X, FileText, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

interface PendingDoctor {
  id: string
  specialty: string
  education_details: string
  years_of_experience: number
  consultation_fee: number
  license_number: string
  bio: string
  clinic_name?: string
  clinic_address?: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string
  }
}

interface AdminStats {
  total_patients: number
  total_doctors: number
  pending_verifications: number
  total_revenue: number
  currency: string
}

export default function AdminPage() {
  const { profile, session } = useUser()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pending, setPending] = useState<PendingDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchAdminData = async () => {
    if (!session?.access_token) return
    try {
      // Fetch stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch pending doctors
      const pendingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/pending`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPending(pendingData)
      }
    } catch (err) {
      console.error("Failed to load admin console details:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && profile?.role === "admin") {
      fetchAdminData()
    } else if (profile) {
      setLoading(false)
    }
  }, [profile, session])

  const handleVerify = async (doctorId: string) => {
    if (!session?.access_token) return
    setActionId(doctorId)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (res.ok) {
        toast.success("Doctor approved and verified successfully! In-app notification sent.")
        setPending(prev => prev.filter(d => d.id !== doctorId))
        // Refresh stats
        fetchAdminData()
      } else {
        toast.error("Failed to verify doctor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network issue. Failed to approve.")
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (doctorId: string) => {
    if (!session?.access_token) return
    setActionId(doctorId)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (res.ok) {
        toast.success("Application rejected and discarded cleanly. Notification sent.")
        setPending(prev => prev.filter(d => d.id !== doctorId))
        fetchAdminData()
      } else {
        toast.error("Failed to reject application.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network issue. Failed to reject.")
    } finally {
      setActionId(null)
    }
  }

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm">This console is only accessible to system platform administrators.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Global stats, payments audits, and physiotherapist verification center.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading system diagnostics...</p>
        </div>
      ) : (
        <>
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            {/* Total Patients */}
            <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.total_patients ?? 0}
                </div>
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Patients</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Doctors */}
            <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.total_doctors ?? 0}
                </div>
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Doctors</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </Card>

            {/* Pending Verifications */}
            <Card className="p-6 rounded-[2rem] bg-amber-500 text-white shadow-lg shadow-amber-500/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-black">{stats?.pending_verifications ?? 0}</div>
                <div className="text-amber-100 font-bold text-xs uppercase tracking-wider">Pending Approvals</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Revenue */}
            <Card className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-black">₹{(stats?.total_revenue ?? 0).toLocaleString("en-IN")}</div>
                <div className="text-indigo-100 font-bold text-xs uppercase tracking-wider">Platform Revenue</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Card>

          </div>

          {/* Pending Applications List */}
          <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pending Verifications</h2>
            </div>

            {pending.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-white/5">
                <ShieldCheck className="w-12 h-12 text-indigo-500/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">All caught up! No pending applications.</p>
                <p className="text-xs text-slate-400 mt-1">New physiotherapist registrations requiring approval will appear here.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {pending.map(doc => {
                    const fullName = `${doc.profiles?.first_name || ""} ${doc.profiles?.last_name || ""}`.trim() || "Physiotherapist User"
                    
                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors"
                      >
                        {/* Profile Meta details */}
                        <div className="space-y-3 flex-1 min-w-0">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{fullName}</h3>
                              <Badge className="text-[10px] px-1.5 py-0 capitalize bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-250/20">
                                Pending Approval
                              </Badge>
                            </div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{doc.specialty} · {doc.years_of_experience} yrs exp</p>
                          </div>

                          {/* Detail fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">Lic: <span className="font-extrabold text-slate-800 dark:text-slate-200">{doc.license_number}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.profiles?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.profiles?.phone_number || "N/A"}</span>
                            </div>
                          </div>

                          {/* Bio details */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Bio:</span> {doc.bio}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2.5 w-full lg:w-auto shrink-0 self-stretch lg:self-auto justify-end border-t lg:border-0 border-slate-200/50 dark:border-white/5 pt-4 lg:pt-0">
                          {/* Reject */}
                          <Button
                            onClick={() => handleReject(doc.id)}
                            disabled={actionId !== null}
                            variant="outline"
                            className="rounded-xl border-red-200/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-bold px-4 h-10 gap-1.5 text-xs flex items-center justify-center shrink-0"
                          >
                            <X className="w-4 h-4" /> Reject
                          </Button>

                          {/* Approve */}
                          <Button
                            onClick={() => handleVerify(doc.id)}
                            disabled={actionId !== null}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 h-10 gap-1.5 text-xs flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/10"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

          </Card>
        </>
      )}

    </div>
  )
}
