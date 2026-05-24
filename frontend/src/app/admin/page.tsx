"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, ShieldAlert, Users, Award, TrendingUp, Sparkles, 
  Check, X, FileText, Mail, Phone, Search, Filter, Ban, RefreshCw, 
  AlertTriangle, Calendar, DollarSign, Megaphone, History, Download, 
  LogOut, Shield, CheckCircle, BanIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

/* ─────────────────── interfaces ─────────────────── */
interface Doctor {
  id: string
  specialty: string
  education_details: string
  years_of_experience: number
  consultation_fee: number
  license_number: string
  bio: string
  is_verified: boolean
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string
  }
}

interface Subscription {
  id: string
  tier: string
  start_date: string
  end_date: string
  status: string
}

interface Patient {
  profile_id: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  active_subscription?: Subscription | null
  subscription_history?: Subscription[]
}

interface Booking {
  id: string
  appointment_time: string
  status: string
  session_type: string
  patient_id: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  doctor?: {
    id: string
    specialty: string
    profiles?: {
      first_name?: string
      last_name?: string
    }
  }
}

interface UserProfile {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  is_suspended?: boolean
  created_at?: string
}

interface AuditLog {
  id: string
  action: string
  target_user?: string
  created_at: string
}

interface AdminStats {
  total_patients: number
  total_doctors: number
  pending_verifications: number
  total_bookings: number
  total_cancellations: number
  active_memberships: number
  total_revenue: number
  currency: string
}

export default function AdminPage() {
  const { profile, session, logout } = useUser()
  const router = useRouter()

  /* tab state */
  const [activeTab, setActiveTab] = useState<"overview" | "doctors" | "memberships" | "bookings" | "users" | "announcements" | "audits">("overview")

  /* platform data states */
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [usersList, setUsersList] = useState<UserProfile[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  /* filters & search states */
  const [searchVal, setSearchVal] = useState("")
  const [filterSpec, setFilterSpec] = useState("all")
  const [filterVerify, setFilterVerify] = useState("all")

  /* announcement states */
  const [announceTarget, setAnnounceTarget] = useState("all")
  const [announceTitle, setAnnounceTitle] = useState("")
  const [announceContent, setAnnounceContent] = useState("")
  const [announceLoading, setAnnounceLoading] = useState(false)

  /* rescheduling states */
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null)
  const [newDateVal, setNewDateVal] = useState("")

  /* manual membership states */
  const [membershipTarget, setMembershipTarget] = useState<string | null>(null)
  const [grantTier, setGrantTier] = useState("monthly")

  /* action loaders */
  const [actionId, setActionId] = useState<string | null>(null)

  /* confirmation modal states */
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    action: () => void
  } | null>(null)

  const fetchAdminData = async () => {
    if (!session?.access_token) return
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${session.access_token}` }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // 1. Fetch Stats
      const statsRes = await fetch(`${apiUrl}/api/v1/admin/stats`, { headers })
      if (statsRes.ok) setStats(await statsRes.json())

      // 2. Fetch Doctors
      const docRes = await fetch(`${apiUrl}/api/v1/admin/doctors`, { headers })
      if (docRes.ok) setDoctors(await docRes.json())

      // 3. Fetch Memberships
      const memRes = await fetch(`${apiUrl}/api/v1/admin/memberships`, { headers })
      if (memRes.ok) setPatients(await memRes.json())

      // 4. Fetch Bookings
      const bookRes = await fetch(`${apiUrl}/api/v1/admin/bookings`, { headers })
      if (bookRes.ok) setBookings(await bookRes.json())

      // 5. Fetch Users
      const userRes = await fetch(`${apiUrl}/api/v1/admin/users`, { headers })
      if (userRes.ok) setUsersList(await userRes.json())

      // 6. Fetch Audits
      const auditRes = await fetch(`${apiUrl}/api/v1/admin/logs`, { headers })
      if (auditRes.ok) setAuditLogs(await auditRes.json())

    } catch (err) {
      console.error("Failed to load admin dataset:", err)
      toast.error("Database connection issue. Could not load latest audits.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Restricted gating checks
    if (session) {
      if (profile && profile.role !== "admin") {
        toast.error("Access Restriction: Account role parameters do not permit dashboard access.")
        router.replace('/')
      } else {
        fetchAdminData()
      }
    }
  }, [profile, session])

  /* ── action executors ── */
  const handleVerify = (doctorId: string, email: string) => {
    setConfirmModal({
      open: true,
      title: "Approve Physiotherapist Profile?",
      message: `Are you sure you want to verify and activate registration card credentials for '${email}'?`,
      action: async () => {
        if (!session?.access_token) return
        setActionId(doctorId)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}/verify`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            toast.success("Physiotherapist verified! Announcement alert pushed in-app.")
            fetchAdminData()
          } else {
            toast.error("Verification failed.")
          }
        } catch (err) {
          toast.error("Network issue. Call failed.")
        } finally {
          setActionId(null)
          setConfirmModal(null)
        }
      }
    })
  }

  const handleSuspend = (doctorId: string, email: string) => {
    setConfirmModal({
      open: true,
      title: "Suspend Doctor Listings?",
      message: `This action toggles off verified status for '${email}', hiding them from the marketplace search directory. Proceed?`,
      action: async () => {
        if (!session?.access_token) return
        setActionId(doctorId)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}/suspend`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            toast.success("Doctor suspended cleanly.")
            fetchAdminData()
          } else {
            toast.error("Suspension override failed.")
          }
        } catch (err) {
          toast.error("Network issue.")
        } finally {
          setActionId(null)
          setConfirmModal(null)
        }
      }
    })
  }

  const handleReject = (doctorId: string, email: string) => {
    setConfirmModal({
      open: true,
      title: "Discard and Reject Application?",
      message: `Permanently delete the unverified profile files for '${email}' and dispatch re-application guides. This action is irreversible.`,
      action: async () => {
        if (!session?.access_token) return
        setActionId(doctorId)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}/reject`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            toast.success("Application discarded clean.")
            fetchAdminData()
          } else {
            toast.error("Discard action failed.")
          }
        } catch (err) {
          toast.error("Network error.")
        } finally {
          setActionId(null)
          setConfirmModal(null)
        }
      }
    })
  }

  const handleCancelBooking = (bookingId: string) => {
    setConfirmModal({
      open: true,
      title: "Force Cancel Booking Session?",
      message: "Force cancel this rehabilitation appointment slot? Both patient and doctor will be notified and a mock refund initialized.",
      action: async () => {
        if (!session?.access_token) return
        setActionId(bookingId)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bookings/${bookingId}/cancel`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            toast.success("Booking force cancelled. Notifications dispatched.")
            fetchAdminData()
          } else {
            toast.error("Booking cancellation override failed.")
          }
        } catch (err) {
          toast.error("Network error.")
        } finally {
          setActionId(null)
          setConfirmModal(null)
        }
      }
    })
  }

  const handleReschedule = async (bookingId: string) => {
    if (!newDateVal) {
      toast.error("Please pick a valid new rescheduling date and time.")
      return
    }
    if (!session?.access_token) return
    setActionId(bookingId)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ new_date: newDateVal })
      })
      if (res.ok) {
        toast.success("Rescheduled successfully! Patient notified.")
        setRescheduleTarget(null)
        setNewDateVal("")
        fetchAdminData()
      } else {
        toast.error("Failed to reschedule slot.")
      }
    } catch (err) {
      toast.error("Network conflict.")
    } finally {
      setActionId(null)
    }
  }

  const handleMembershipUpdate = async (profileId: string, action: "grant" | "revoke") => {
    if (!session?.access_token) return
    setActionId(profileId)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/memberships/${profileId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
          tier: grantTier,
          action
        })
      })
      if (res.ok) {
        toast.success(action === "grant" ? "PhysioPass active status granted manually!" : "PhysioPass active status manual revoke completed.")
        setMembershipTarget(null)
        fetchAdminData()
      } else {
        toast.error("Membership status change failed.")
      }
    } catch (err) {
      toast.error("Network issue.")
    } finally {
      setActionId(null)
    }
  }

  const handleToggleBan = (profileId: string, email: string, isSuspended: boolean) => {
    const actionWord = isSuspended ? "Reactivate" : "Ban & Suspend"
    setConfirmModal({
      open: true,
      title: `${actionWord} User Account?`,
      message: `Confirm to toggle account status for '${email}'. Suspended accounts are immediately logged out and blocked from logging in again.`,
      action: async () => {
        if (!session?.access_token) return
        setActionId(profileId)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${profileId}/ban`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) {
            toast.success(`User successfully ${isSuspended ? "reactivated" : "suspended"}!`)
            fetchAdminData()
          } else {
            toast.error("Failed to execute ban toggle.")
          }
        } catch (err) {
          toast.error("Network override failed.")
        } finally {
          setActionId(null)
          setConfirmModal(null)
        }
      }
    })
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announceTitle.trim() || !announceContent.trim()) {
      toast.error("Announcements require titles and contents.")
      return
    }
    if (!session?.access_token) return
    setAnnounceLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/announce`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          target: announceTarget,
          title: announceTitle.trim(),
          content: announceContent.trim()
        })
      })
      if (res.ok) {
        toast.success("Global cohort announcement dispatched platform-wide successfully!")
        setAnnounceTitle("")
        setAnnounceContent("")
      } else {
        toast.error("Announcement dispatch failed.")
      }
    } catch (err) {
      toast.error("Announcement request network error.")
    } finally {
      setAnnounceLoading(false)
    }
  }

  /* ── data exporters ── */
  const exportUsersCSV = () => {
    try {
      const headers = ["User ID", "Email Address", "Profile Role", "Is Banned", "Registration Date"]
      const rows = usersList.map(u => [
        u.id, 
        u.email, 
        u.role, 
        u.is_suspended ? "Banned" : "Active", 
        u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"
      ])
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `CuraReb_Users_Export_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("CSV User directory export complete!")
    } catch (err) {
      toast.error("Export failure.")
    }
  }

  const exportBookingsCSV = () => {
    try {
      const headers = ["Booking ID", "Appointment Time", "Status", "Session Type", "Patient Email", "Doctor Name"]
      const rows = bookings.map(b => [
        b.id,
        b.appointment_time,
        b.status,
        b.session_type,
        b.profiles?.email || "N/A",
        b.doctor?.profiles ? `${b.doctor.profiles.first_name} ${b.doctor.profiles.last_name}` : "N/A"
      ])
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `CuraReb_Bookings_Export_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("CSV Booking directory export complete!")
    } catch (err) {
      toast.error("Export failure.")
    }
  }

  const handleAdminLogout = () => {
    toast.success("Administrator session cleared successfully.")
    logout()
    router.push('/admin/login')
  }

  /* ── filters triggers ── */
  const filteredDoctors = doctors.filter(doc => {
    const nameMatch = `${doc.profiles?.first_name || ""} ${doc.profiles?.last_name || ""}`.toLowerCase().includes(searchVal.toLowerCase()) ||
                      (doc.profiles?.email || "").toLowerCase().includes(searchVal.toLowerCase())
    const specMatch = filterSpec === "all" || doc.specialty.toLowerCase() === filterSpec.toLowerCase()
    const verifyMatch = filterVerify === "all" || 
                        (filterVerify === "verified" && doc.is_verified) || 
                        (filterVerify === "unverified" && !doc.is_verified)
    return nameMatch && specMatch && verifyMatch
  })

  const filteredPatients = patients.filter(pat => {
    const query = `${pat.profiles?.first_name || ""} ${pat.profiles?.last_name || ""}`.toLowerCase().includes(searchVal.toLowerCase()) ||
                  (pat.profiles?.email || "").toLowerCase().includes(searchVal.toLowerCase())
    return query
  })

  const filteredBookings = bookings.filter(b => {
    const query = `${b.profiles?.first_name || ""} ${b.profiles?.last_name || ""}`.toLowerCase().includes(searchVal.toLowerCase()) ||
                  (b.profiles?.email || "").toLowerCase().includes(searchVal.toLowerCase()) ||
                  (b.doctor?.profiles?.first_name || "").toLowerCase().includes(searchVal.toLowerCase())
    return query
  })

  const filteredUsers = usersList.filter(u => {
    const query = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(searchVal.toLowerCase()) ||
                  (u.email || "").toLowerCase().includes(searchVal.toLowerCase())
    return query
  })

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm">This console is only accessible to system platform administrators.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── HEADER NAVIGATION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center shadow-inner border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Admin Console</h1>
            <p className="text-slate-400 font-medium text-xs mt-0.5">Platform Auditing, Doctors Verification & Patient Memberships Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <Button 
            onClick={fetchAdminData} 
            variant="outline" 
            className="rounded-xl border-white/10 text-xs font-bold hover:bg-white/5 h-10 gap-1.5 flex items-center shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button 
            onClick={handleAdminLogout} 
            className="rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 text-xs font-bold h-10 gap-1.5 flex items-center shrink-0"
          >
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading system audit matrices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ── SIDEBAR CONTROLS ── */}
          <div className="lg:col-span-1 space-y-2.5">
            <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 space-y-1">
              {[
                { id: "overview", label: "Dashboard Overview", icon: TrendingUp },
                { id: "doctors", label: "Doctor Directory", icon: Award },
                { id: "memberships", label: "Patient Memberships", icon: ShieldCheck },
                { id: "bookings", label: "Booking Calendars", icon: Calendar },
                { id: "users", label: "Security Directory", icon: Users },
                { id: "announcements", label: "Global Announcer", icon: Megaphone },
                { id: "audits", label: "Administrative Audits", icon: History }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setSearchVal("") }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-bold text-xs capitalize ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Exporters widget */}
            <div className="p-4 bg-slate-900/20 rounded-2xl border border-white/5 space-y-3 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">System Diagnostics Exporters</span>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={exportUsersCSV} className="bg-slate-950 hover:bg-slate-900 text-slate-300 font-extrabold text-[10px] rounded-xl h-9 gap-1 flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" /> Users CSV
                </Button>
                <Button onClick={exportBookingsCSV} className="bg-slate-950 hover:bg-slate-900 text-slate-300 font-extrabold text-[10px] rounded-xl h-9 gap-1 flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" /> Bookings CSV
                </Button>
              </div>
            </div>
          </div>

          {/* ── CENTRAL DASHBOARD ── */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* ── SUB-TABS VIEWS ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* 1. OVERVIEW / ANALYTICS */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Revenue */}
                      <Card className="p-6 rounded-[2rem] bg-indigo-600 border-none text-white shadow-xl shadow-indigo-600/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-3xl font-black">₹{(stats?.total_revenue ?? 0).toLocaleString("en-IN")}</div>
                          <div className="text-indigo-100 font-bold text-xs uppercase tracking-wider">Revenue Audit</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      </Card>

                      {/* Active Memberships */}
                      <Card className="p-6 rounded-[2rem] bg-emerald-600 border-none text-white shadow-xl shadow-emerald-600/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-3xl font-black">{stats?.active_memberships ?? 0}</div>
                          <div className="text-emerald-100 font-bold text-xs uppercase tracking-wider">Active Memberships</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                      </Card>

                      {/* Total Bookings */}
                      <Card className="p-6 rounded-[2rem] bg-slate-900 border-white/5 text-white shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-3xl font-black">{stats?.total_bookings ?? 0}</div>
                          <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Bookings</div>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                          <Calendar className="w-6 h-6 text-indigo-400" />
                        </div>
                      </Card>
                    </div>

                    {/* Stats Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { label: "Registered Patients", val: stats?.total_patients ?? 0, icon: Users, color: "text-blue-400 bg-blue-500/10" },
                        { label: "Marketplace Doctors", val: stats?.total_doctors ?? 0, icon: Award, color: "text-emerald-400 bg-emerald-500/10" },
                        { label: "Pending verifications", val: stats?.pending_verifications ?? 0, icon: ShieldAlert, color: "text-amber-400 bg-amber-500/10" },
                        { label: "Booking Cancellations", val: stats?.total_cancellations ?? 0, icon: X, color: "text-red-400 bg-red-500/10" }
                      ].map((card, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{card.label}</div>
                            <div className="text-2xl font-black text-white">{card.val}</div>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Mock Box */}
                    <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-400" />
                          <span className="font-extrabold text-sm tracking-tight">Platform Weekly Activity Audit</span>
                        </div>
                        <Badge className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black border-none uppercase px-2 py-0.5">Live Data feed</Badge>
                      </div>
                      <div className="h-44 flex items-end justify-between gap-2.5 pt-8 border-b border-white/5 pb-2">
                        {[30, 45, 25, 60, 80, 50, 95].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05 }}
                              className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-emerald-500 hover:to-emerald-400 transition-colors cursor-pointer"
                            />
                            <span className="text-[9px] font-black text-slate-500 uppercase">W{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* 2. DOCTOR DIRECTORY */}
                {activeTab === "doctors" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-black tracking-tight">Registered Specialists</h2>
                      </div>
                      <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                        <Input
                          placeholder="Search doctor or email..."
                          value={searchVal}
                          onChange={e => setSearchVal(e.target.value)}
                          className="rounded-xl h-10 bg-slate-950/50 border-white/10 text-xs w-full md:w-52"
                        />
                        <select
                          value={filterSpec}
                          onChange={e => setFilterSpec(e.target.value)}
                          className="rounded-xl h-10 px-3 bg-slate-950 border border-white/10 text-xs font-semibold text-slate-400"
                        >
                          <option value="all">All Specialities</option>
                          <option value="General">General</option>
                          <option value="ortho">Ortho Physio</option>
                          <option value="neuro">Neuro Rehab</option>
                          <option value="cardiac">Cardiac Rehab</option>
                        </select>
                        <select
                          value={filterVerify}
                          onChange={e => setFilterVerify(e.target.value)}
                          className="rounded-xl h-10 px-3 bg-slate-950 border border-white/10 text-xs font-semibold text-slate-400"
                        >
                          <option value="all">All Verification Statuses</option>
                          <option value="verified">Verified Only</option>
                          <option value="unverified">Pending Approvals</option>
                        </select>
                      </div>
                    </div>

                    {filteredDoctors.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
                        <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No doctors match your query filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDoctors.map(doc => {
                          const docName = `${doc.profiles?.first_name || ""} ${doc.profiles?.last_name || ""}`.trim() || "Physiotherapist User"
                          return (
                            <div key={doc.id} className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-sm">{docName}</h3>
                                  <Badge className={`text-[9px] px-1.5 py-0 border-none font-bold capitalize ${
                                    doc.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                  }`}>
                                    {doc.is_verified ? "Verified" : "Pending Approval"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-indigo-400 font-bold">{doc.specialty} · {doc.years_of_experience} yrs experience</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>Licence ID: <strong className="text-slate-300">{doc.license_number}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>{doc.profiles?.email}</span>
                                  </div>
                                </div>
                                {doc.bio && (
                                  <p className="text-[11px] text-slate-500 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 leading-relaxed truncate">
                                    <strong>Bio:</strong> {doc.bio}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 self-stretch md:self-auto justify-end border-t md:border-0 border-white/5 pt-4 md:pt-0">
                                {doc.is_verified ? (
                                  <Button
                                    onClick={() => handleSuspend(doc.id, doc.profiles?.email || "")}
                                    disabled={actionId !== null}
                                    className="rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 font-bold text-xs h-9 px-3 gap-1 flex items-center"
                                  >
                                    <Ban className="w-4 h-4" /> Suspend
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => handleReject(doc.id, doc.profiles?.email || "")}
                                      disabled={actionId !== null}
                                      variant="outline"
                                      className="rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-500 font-bold text-xs h-9 px-3 gap-1 flex items-center"
                                    >
                                      <X className="w-4 h-4" /> Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleVerify(doc.id, doc.profiles?.email || "")}
                                      disabled={actionId !== null}
                                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 gap-1 flex items-center shadow-lg shadow-emerald-600/10"
                                    >
                                      <Check className="w-4 h-4" /> Approve
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {/* 3. PATIENT MEMBERSHIPS */}
                {activeTab === "memberships" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-black tracking-tight">Patient Memberships Directory</h2>
                      </div>
                      <Input
                        placeholder="Search patient name..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        className="rounded-xl h-10 bg-slate-950/50 border-white/10 text-xs w-full md:w-52"
                      />
                    </div>

                    {filteredPatients.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
                        <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No patients match your query search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPatients.map(pat => {
                          const patientName = `${pat.profiles?.first_name || ""} ${pat.profiles?.last_name || ""}`.trim() || "Patient User"
                          const activeSub = pat.active_subscription
                          return (
                            <div key={pat.profile_id} className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h3 className="font-extrabold text-sm">{patientName}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {pat.profiles?.email}
                                </p>
                                {activeSub ? (
                                  <div className="pt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] font-semibold">
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold uppercase text-[9px] px-2 py-0.5">
                                      Active PhysioPass
                                    </Badge>
                                    <span className="text-slate-400">Tier: <strong className="text-slate-200 uppercase">{activeSub.tier} Plan</strong></span>
                                    <span className="text-slate-500">Valid Till: <strong className="text-slate-400">{new Date(activeSub.end_date).toLocaleDateString()}</strong></span>
                                  </div>
                                ) : (
                                  <Badge className="bg-slate-800 text-slate-500 border-none font-bold uppercase text-[9px] px-2 py-0.5">
                                    No Active Membership
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-0 border-white/5 pt-4 md:pt-0">
                                {membershipTarget === pat.profile_id ? (
                                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/5 animate-in slide-in-from-right-2">
                                    <select
                                      value={grantTier}
                                      onChange={e => setGrantTier(e.target.value)}
                                      className="bg-transparent border-none text-xs font-semibold text-slate-300 outline-none"
                                    >
                                      <option value="weekly">Weekly Plan (₹499)</option>
                                      <option value="monthly">Monthly Plan (₹1499)</option>
                                      <option value="yearly">Yearly Plan (₹9999)</option>
                                    </select>
                                    <Button
                                      onClick={() => handleMembershipUpdate(pat.profile_id, "grant")}
                                      disabled={actionId !== null}
                                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] h-8 px-2"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      onClick={() => setMembershipTarget(null)}
                                      className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] h-8 px-2"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => { setMembershipTarget(pat.profile_id); setGrantTier("monthly") }}
                                      disabled={actionId !== null}
                                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-3 gap-1 flex items-center"
                                    >
                                      Grant Plan
                                    </Button>
                                    {activeSub && (
                                      <Button
                                        onClick={() => handleMembershipUpdate(pat.profile_id, "revoke")}
                                        disabled={actionId !== null}
                                        className="rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-bold text-xs h-9 px-3 gap-1 flex items-center animate-in fade-in"
                                      >
                                        Revoke Plan
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {/* 4. BOOKINGS */}
                {activeTab === "bookings" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-black tracking-tight">Active Marketplace Consultations</h2>
                      </div>
                      <Input
                        placeholder="Search patient or doctor..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        className="rounded-xl h-10 bg-slate-950/50 border-white/10 text-xs w-full md:w-52"
                      />
                    </div>

                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
                        <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No active bookings match your query search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map(b => {
                          const patientName = `${b.profiles?.first_name || ""} ${b.profiles?.last_name || ""}`.trim() || "Patient"
                          const docName = b.doctor?.profiles ? `${b.doctor.profiles.first_name} ${b.doctor.profiles.last_name}` : "Specialist"
                          const isCancelled = b.status === "cancelled"
                          return (
                            <div key={b.id} className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-extrabold text-sm">{patientName} ↔ Dr. {docName}</span>
                                  <Badge className={`text-[8px] px-1.5 py-0 border-none font-bold uppercase ${
                                    isCancelled ? "bg-red-500/10 text-red-400" : b.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                                  }`}>
                                    {b.status}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Time: <strong className="text-slate-300">{new Date(b.appointment_time).toLocaleString()}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Type: <strong className="text-slate-300 capitalize">{b.session_type}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end border-t lg:border-0 border-white/5 pt-4 lg:pt-0">
                                {!isCancelled && (
                                  <>
                                    {rescheduleTarget === b.id ? (
                                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/5 animate-in slide-in-from-right-2">
                                        <input
                                          type="datetime-local"
                                          value={newDateVal}
                                          onChange={e => setNewDateVal(e.target.value)}
                                          className="bg-transparent border-none text-xs font-semibold text-slate-300 outline-none h-8 w-44"
                                        />
                                        <Button
                                          onClick={() => handleReschedule(b.id)}
                                          disabled={actionId !== null}
                                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] h-8 px-2"
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          onClick={() => setRescheduleTarget(null)}
                                          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] h-8 px-2"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <Button
                                          onClick={() => { setRescheduleTarget(b.id); setNewDateVal("") }}
                                          disabled={actionId !== null}
                                          className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-slate-300 font-bold text-xs h-9 px-3 gap-1 flex items-center"
                                        >
                                          Reschedule
                                        </Button>
                                        <Button
                                          onClick={() => handleCancelBooking(b.id)}
                                          disabled={actionId !== null}
                                          className="rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-bold text-xs h-9 px-3 gap-1 flex items-center"
                                        >
                                          Cancel Booking
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {/* 5. USER DIRECTORY & SECURITY BANS */}
                {activeTab === "users" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-black tracking-tight">Directory Banned Accounts override</h2>
                      </div>
                      <Input
                        placeholder="Search email or name..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        className="rounded-xl h-10 bg-slate-950/50 border-white/10 text-xs w-full md:w-52"
                      />
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
                        <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No users match your query search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredUsers.map(user => {
                          const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "CuraReb Member"
                          const isBanned = user.is_suspended
                          return (
                            <div key={user.id} className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                  <h3 className="font-extrabold text-sm">{fullName}</h3>
                                  <Badge className={`text-[8px] px-1.5 py-0 border-none font-bold uppercase ${
                                    isBanned ? "bg-red-500/10 text-red-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                                  }`}>
                                    {isBanned ? "Suspended" : "Active"}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="capitalize">{user.role}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 self-stretch md:self-auto justify-end border-t md:border-0 border-white/5 pt-4 md:pt-0">
                                <Button
                                  onClick={() => handleToggleBan(user.id, user.email, isBanned || false)}
                                  disabled={actionId !== null}
                                  className={`rounded-xl font-bold text-xs h-9 px-3 gap-1 flex items-center shadow-lg ${
                                    isBanned 
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10" 
                                      : "bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 shadow-red-600/10"
                                  }`}
                                >
                                  {isBanned ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" /> Activate Account
                                    </>
                                  ) : (
                                    <>
                                      <BanIcon className="w-4 h-4" /> Suspend Account
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {/* 6. GLOBAL COHORT ANNOUNCEMENT */}
                {activeTab === "announcements" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-black tracking-tight">Push Global Cohort Announcement</h2>
                    </div>

                    <form onSubmit={handleBroadcast} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Target User Cohort Group</label>
                        <select
                          value={announceTarget}
                          onChange={e => setAnnounceTarget(e.target.value)}
                          className="w-full rounded-xl h-12 px-3 bg-slate-950 border border-white/10 text-xs font-semibold text-slate-300"
                        >
                          <option value="all">All Platform Users (Patients & Doctors)</option>
                          <option value="patients">Registered Patients Only</option>
                          <option value="doctors">Marketplace Doctors Only</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Announcement Title / Subject</label>
                        <Input
                          placeholder="Announcements subject line..."
                          value={announceTitle}
                          onChange={e => setAnnounceTitle(e.target.value)}
                          className="rounded-xl h-12 bg-slate-950/50 border-white/10 text-xs text-white"
                          required
                          disabled={announceLoading}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Push Message Body Content</label>
                        <textarea
                          placeholder="Type details that will appear inside targeted cohort in-app notifications boxes..."
                          value={announceContent}
                          onChange={e => setAnnounceContent(e.target.value)}
                          className="w-full p-3 h-32 rounded-xl bg-slate-950/50 border border-white/10 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-600 font-semibold leading-relaxed"
                          required
                          disabled={announceLoading}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={announceLoading}
                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20"
                      >
                        {announceLoading ? "Sending broadcast..." : "Push Global Broadcast Announcement"}
                      </Button>
                    </form>
                  </Card>
                )}

                {/* 7. AUDITS LOGS */}
                {activeTab === "audits" && (
                  <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-black tracking-tight">Administrative Audits Action Log</h2>
                    </div>

                    {auditLogs.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
                        <History className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">All quiet! No administrative operations logged yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {auditLogs.map(log => (
                          <div key={log.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] font-semibold text-slate-300 leading-normal flex justify-between gap-4 items-center">
                            <div>
                              <p className="text-white font-bold">{log.action}</p>
                              {log.target_user && (
                                <p className="text-[10px] text-slate-500 mt-0.5">Target UUID: {log.target_user}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0 font-bold">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRMATION OVERLAY MODAL ── */}
      <AnimatePresence>
        {confirmModal && confirmModal.open && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[250]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[251] w-full max-w-[400px] px-4"
              initial={{ scale: 0.95, opacity: 0, y: "-40%" }}
              animate={{ scale: 1, opacity: 1, y: "-50%" }}
              exit={{ scale: 0.95, opacity: 0, y: "-40%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <Card className="p-6 rounded-[2rem] bg-slate-900 border-white/5 shadow-2xl relative overflow-hidden space-y-5 text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black tracking-tight text-white">{confirmModal.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">{confirmModal.message}</p>
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <Button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs h-10 border border-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmModal.action}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-10 shadow-lg shadow-red-600/10"
                  >
                    Confirm Action
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
