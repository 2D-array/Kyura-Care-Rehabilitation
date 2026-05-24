"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Plus, Trash2, ShieldAlert, Check, Sparkles, AlertCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@supabase/ssr"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

type AvailabilitySlot = {
  day_of_week: number  // 0=Sunday, 1=Monday ... 6=Saturday
  start_time: string   // "09:00:00" or "09:00"
  end_time: string     // "17:00:00" or "17:00"
  session_types: string[]
}

const DAYS_OF_WEEK = [
  { label: "Sunday", index: 0 },
  { label: "Monday", index: 1 },
  { label: "Tuesday", index: 2 },
  { label: "Wednesday", index: 3 },
  { label: "Thursday", index: 4 },
  { label: "Friday", index: 5 },
  { label: "Saturday", index: 6 }
]

const SESSION_OPTIONS = [
  { id: "online", label: "Online (Video)" },
  { id: "in-clinic", label: "In-Clinic" },
  { id: "at-home", label: "At-Home Care" }
]

export default function AvailabilityPage() {
  const { profile, session } = useUser()
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [activeDay, setActiveDay] = useState(1) // Default to Monday
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Slot creation form states
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [selectedSessions, setSelectedSessions] = useState<string[]>(["online", "in-clinic"])

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!session?.access_token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/me/availability`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setSlots(data)
        }
      } catch (err) {
        console.error("Failed to load doctor availability schedule:", err)
      } finally {
        setLoading(false)
      }
    }
    if (session) {
      fetchAvailability()
    }
  }, [session])

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()

    if (startTime >= endTime) {
      toast.error("Start time must be strictly before end time.")
      return
    }

    if (selectedSessions.length === 0) {
      toast.error("Please select at least one session type for this slot.")
      return
    }

    // Check overlaps on the active day
    const daySlots = slots.filter(s => s.day_of_week === activeDay)
    const hasOverlap = daySlots.some(s => {
      const sStart = s.start_time.slice(0, 5)
      const sEnd = s.end_time.slice(0, 5)
      return (startTime >= sStart && startTime < sEnd) ||
             (endTime > sStart && endTime <= sEnd) ||
             (startTime <= sStart && endTime >= sEnd)
    })

    if (hasOverlap) {
      toast.error("This slot overlaps with an existing availability slot.")
      return
    }

    const newSlot: AvailabilitySlot = {
      day_of_week: activeDay,
      start_time: startTime,
      end_time: endTime,
      session_types: [...selectedSessions]
    }

    setSlots(prev => [...prev, newSlot].sort((a, b) => a.start_time.localeCompare(b.start_time)))
    toast.success("Availability slot added locally. Click 'Save Schedule' to upload.")
  }

  const handleDeleteSlot = (indexToDelete: number) => {
    const activeDaySlots = slots.filter(s => s.day_of_week === activeDay)
    const activeSlotToDelete = activeDaySlots[indexToDelete]

    setSlots(prev =>
      prev.filter(s => 
        !(s.day_of_week === activeDay && 
          s.start_time === activeSlotToDelete.start_time && 
          s.end_time === activeSlotToDelete.end_time)
      )
    )
    toast.info("Slot removed locally. Remember to click 'Save Schedule'.")
  }

  const handleSaveSchedule = async () => {
    if (!session?.access_token) return
    setSaving(true)
    try {
      const payload = slots.map(s => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
        session_types: s.session_types
      }))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/me/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Weekly availability schedule successfully published! 📅")
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to update availability schedule.")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "An error occurred while publishing availability.")
    } finally {
      setSaving(false)
    }
  }

  const toggleSession = (id: string) => {
    setSelectedSessions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  if (profile?.role !== "doctor") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm">This page is only accessible to verified physiotherapists.</p>
      </div>
    )
  }

  const activeDaySlots = slots.filter(s => s.day_of_week === activeDay)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manage Availability 📅
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Organize your recurring weekly practice times and session options.
          </p>
        </div>
        <Button
          onClick={handleSaveSchedule}
          disabled={saving || loading}
          className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 gap-2 shadow-lg shadow-indigo-600/20 shrink-0 self-start sm:self-auto"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Schedule
            </>
          )}
        </Button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Availability Scheduler Tab Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day of Week Selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DAYS_OF_WEEK.map(day => {
              const isActive = activeDay === day.index
              const count = slots.filter(s => s.day_of_week === day.index).length
              return (
                <button
                  key={day.index}
                  onClick={() => setActiveDay(day.index)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {day.label}
                  {count > 0 && (
                    <Badge className={`px-1.5 py-0 text-[10px] ${
                      isActive ? "bg-white text-indigo-600" : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    }`}>
                      {count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>

          {/* Slots List Card */}
          <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-md">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Slots for {DAYS_OF_WEEK.find(d => d.index === activeDay)?.label}
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Fetching weekly timetable...</p>
              </div>
            ) : activeDaySlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-500">No availability slots configured for this day.</p>
                <p className="text-xs text-slate-400 mt-1">Configure time slots in the sidebar builder to open scheduling.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout">
                  {activeDaySlots.map((slot, index) => (
                    <motion.div
                      key={`${slot.start_time}-${slot.end_time}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {slot.session_types.map(type => (
                              <Badge key={type} className="text-[9px] px-1.5 py-0 capitalize bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/20 font-bold">
                                {type === "online" ? "Video Call" : type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteSlot(index)}
                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-0 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>

        {/* Slot Creation Form Column */}
        <div className="space-y-6">
          <Card className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-md sticky top-28">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Add Time Slot</h3>
            </div>
            
            <form onSubmit={handleAddSlot} className="space-y-5">
              {/* Start Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* End Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Session Types Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Session Types</label>
                <div className="space-y-2.5">
                  {SESSION_OPTIONS.map(opt => {
                    const isChecked = selectedSessions.includes(opt.id)
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleSession(opt.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-indigo-500/5 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium"
                        }`}
                      >
                        <span className="text-xs">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-transparent"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold gap-1.5 shadow-md shadow-indigo-600/10 mt-2"
              >
                <Plus className="w-4 h-4" /> Add to Schedule
              </Button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  )
}
