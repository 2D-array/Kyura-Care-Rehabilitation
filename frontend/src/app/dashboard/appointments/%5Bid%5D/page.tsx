"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Shield, Clock, Users, Maximize, Activity, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChatPanel } from "@/components/chat-panel"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

interface AppointmentDetails {
  id: string
  appointment_time: string
  session_type: string
  status: string
  hms_room_id?: string
  doctor_id: string
  patient_id: string
  doctors?: {
    profiles?: {
      first_name?: string
      last_name?: string
      specialty?: string
    }
  }
  patients?: {
    profiles?: {
      first_name?: string
      last_name?: string
    }
  }
}

export default function AppointmentSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { profile, session } = useUser()
  const { id } = use(params)
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [tokenData, setTokenData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Call Settings
  const [micActive, setMicActive] = useState(true)
  const [camActive, setCamActive] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Local media stream references
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  // 1. Fetch Room Tokens and Details
  useEffect(() => {
    const initSession = async () => {
      if (!session?.access_token) return
      try {
        // Fetch appointment details first
        const apptRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (apptRes.ok) {
          const list = await apptRes.json()
          const item = list.find((a: any) => a.id === id)
          if (item) {
            setAppointment(item)
          } else {
            toast.error("Session details not found.")
            router.push("/dashboard")
            return
          }
        }

        // Fetch join token
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${id}/room-token`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const tokenDetails = await res.json()
          setTokenData(tokenDetails)
        } else {
          toast.error("Failed to retrieve room token credentials.")
        }
      } catch (err) {
        console.error("Video room load error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      initSession()
    }
  }, [id, session, router])

  // 2. Local Camera Feed Stream Activation
  useEffect(() => {
    const startLocalStream = async () => {
      if (!camActive) {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop())
          setLocalStream(null)
        }
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
          audio: micActive
        })
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.warn("Camera hardware access denied or not present.", err)
      }
    }

    if (camActive && !loading) {
      startLocalStream()
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [camActive, loading])

  // 3. Call Duration Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEndCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    toast.info("Tele-Rehabilitation call session ended.")
    router.push("/dashboard")
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading secure tele-rehab video room...</p>
      </div>
    )
  }

  const isPatient = profile?.role === "patient"
  const partnerName = isPatient
    ? appointment?.doctors?.profiles?.first_name 
      ? `Dr. ${appointment.doctors.profiles.first_name} ${appointment.doctors.profiles.last_name || ''}`.trim()
      : "Physiotherapist"
    : appointment?.patients?.profiles?.first_name
      ? `${appointment.patients.profiles.first_name} ${appointment.patients.profiles.last_name || ''}`.trim()
      : "Patient Client"

  const initials = isPatient 
    ? appointment?.doctors?.profiles?.first_name ? `${appointment.doctors.profiles.first_name[0]}${appointment.doctors.profiles.last_name?.[0] || ''}` : "DR"
    : appointment?.patients?.profiles?.first_name ? `${appointment.patients.profiles.first_name[0]}${appointment.patients.profiles.last_name?.[0] || ''}` : "PT"

  return (
    <div className="min-h-screen bg-[#05050c] text-white flex flex-col relative overflow-hidden">
      
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              CuraReb Tele-Session <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {appointment?.session_type} Rehabilitation
            </p>
          </div>
        </div>

        {/* Timer Badge */}
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-black text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            {formatTimer(callDuration)}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-emerald-400" /> Secure Encryption
          </div>
        </div>
      </header>

      {/* Call layout body container */}
      <div className="flex-1 flex min-h-0 relative z-10">
        
        {/* Videos Streams Feed Grid */}
        <div className="flex-1 p-6 flex flex-col md:grid md:grid-cols-2 gap-6 min-w-0">
          
          {/* Main Feed: Therapist Feed or Placeholder */}
          <Card className="flex-1 rounded-[2.5rem] bg-[#0c0d19] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
            {/* Therapist mock call feed indicator */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {partnerName}
            </div>

            {/* Glowing audio meter visualization mockup */}
            <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-semibold text-slate-400">Audio Active</span>
            </div>

            {/* In-call therapist simulator screen */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-3xl shadow-xl border-4 border-indigo-500/20 animate-pulse duration-[3s] uppercase">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-extrabold text-base text-white">{partnerName}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Connected in high-fidelity tele-rehab feed</p>
              </div>
            </div>
          </Card>

          {/* Secondary Feed: Patient Self camera stream or off representation */}
          <Card className="flex-1 rounded-[2.5rem] bg-[#0c0d19] border border-white/5 relative overflow-hidden flex items-center justify-center group shadow-2xl">
            {/* Identity badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-bold">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              You (Self)
            </div>

            {/* Live Camera Stream Feed */}
            {camActive ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 rounded-[2.5rem]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-18 h-18 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <VideoOff className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-xs text-slate-400">Your Camera is Off</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Toggle video below to enable stream</p>
                </div>
              </div>
            )}
          </Card>

        </div>

        {/* Messaging Chat side Drawer */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full shrink-0 flex flex-col"
            >
              <ChatPanel appointmentId={id} onClose={() => setChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Media Controller Bar Footer */}
      <footer className="px-6 py-5 border-t border-white/5 bg-slate-950/60 backdrop-blur-md flex items-center justify-center gap-4 z-10 shrink-0 relative">
        {/* Toggle Mic */}
        <Button
          onClick={() => setMicActive(prev => !prev)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
            micActive
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
          }`}
          title={micActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        {/* Toggle Video Camera */}
        <Button
          onClick={() => setCamActive(prev => !prev)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
            camActive
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
          }`}
          title={camActive ? "Stop Camera" : "Start Camera"}
        >
          {camActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        {/* End Call session */}
        <Button
          onClick={handleEndCall}
          className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/20 border border-red-500"
          title="End Tele-Session"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>

        {/* Toggle Chat panel sidebar */}
        <Button
          onClick={() => setChatOpen(prev => !prev)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
            chatOpen
              ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
              : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
          }`}
          title="Toggle Chat Panel"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </footer>

    </div>
  )
}
