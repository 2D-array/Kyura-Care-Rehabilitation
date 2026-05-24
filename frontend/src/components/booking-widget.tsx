"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DayPicker } from "react-day-picker"
import { createBrowserClient } from "@supabase/ssr"
import {
  Video, Home as HomeIcon, Building2, Clock, Check,
  ChevronRight, AlertCircle, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

interface AvailabilitySlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  session_types: string[]
  is_active: boolean
}

interface BookingWidgetProps {
  doctorId: string
  doctorName: string
  consultationFee: number
  availableSessionTypes?: string[]
}

const SESSION_TYPE_CONFIG = [
  { id: "online", label: "Online", icon: Video, color: "indigo" },
  { id: "in-clinic", label: "Clinic", icon: Building2, color: "blue" },
  { id: "at-home", label: "Home", icon: HomeIcon, color: "emerald" },
] as const

// Generate time slots from start/end time strings (1-hour intervals)
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [startH] = startTime.split(":").map(Number)
  const [endH] = endTime.split(":").map(Number)

  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
  }
  return slots
}

export function BookingWidget({
  doctorId,
  doctorName,
  consultationFee,
  availableSessionTypes = ["online", "in-clinic", "at-home"],
}: BookingWidgetProps) {
  const router = useRouter()
  const { user, profile } = useUser()

  // Step state: 1=type, 2=date, 3=time, 4=confirm
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch doctor availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/${doctorId}/availability`
        )
        if (res.ok) {
          const data = await res.json()
          setAvailability(data)
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err)
      }
    }
    fetchAvailability()
  }, [doctorId])

  // Available days of week based on availability data
  const availableDays = useMemo(() => {
    if (availability.length === 0) {
      // If no availability is set, allow all weekdays as default
      return [1, 2, 3, 4, 5] // Mon-Fri
    }
    const days = new Set<number>()
    availability
      .filter(
        (s) =>
          !selectedType || s.session_types.includes(selectedType)
      )
      .forEach((s) => days.add(s.day_of_week))
    return Array.from(days)
  }, [availability, selectedType])

  // Disable dates that are not in available days or are in the past
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true
    // day_of_week: 0=Sunday, 6=Saturday (matches JS getDay())
    return !availableDays.includes(date.getDay())
  }

  // Time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return []

    const dayOfWeek = selectedDate.getDay()
    const daySlots = availability.filter(
      (s) =>
        s.day_of_week === dayOfWeek &&
        (!selectedType || s.session_types.includes(selectedType))
    )

    if (daySlots.length === 0) {
      // Default: 9am-5pm
      return generateTimeSlots("09:00", "17:00")
    }

    const allSlots: string[] = []
    daySlots.forEach((s) => {
      allSlots.push(...generateTimeSlots(s.start_time, s.end_time))
    })
    return [...new Set(allSlots)].sort()
  }, [selectedDate, availability, selectedType])

  // Fetch booked slots for selected date
  useEffect(() => {
    if (!selectedDate) return

    const fetchBooked = async () => {
      try {
        const dateStr = selectedDate.toISOString().split("T")[0]
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
          .from("appointments")
          .select("appointment_time")
          .eq("doctor_id", doctorId)
          .eq("status", "scheduled")
          .gte("appointment_time", `${dateStr}T00:00:00`)
          .lte("appointment_time", `${dateStr}T23:59:59`)

        const booked = (data || []).map((a: { appointment_time: string }) => {
          const d = new Date(a.appointment_time)
          return `${String(d.getHours()).padStart(2, "0")}:00`
        })
        setBookedSlots(booked)
      } catch (err) {
        console.error(err)
      }
    }
    fetchBooked()
  }, [selectedDate, doctorId])

  // Available (not booked) time slots
  const availableTimeSlots = timeSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  )

  const handleBook = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setBookingLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const dateStr = selectedDate!.toISOString().split("T")[0]
      const appointmentDate = `${dateStr}T${selectedTime}:00Z`

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            doctor_id: doctorId,
            appointment_date: appointmentDate,
            session_type: selectedType,
          }),
        }
      )

      if (res.ok) {
        setBookingSuccess(true)
        toast.success("Appointment booked successfully!", {
          description: `Your ${selectedType} session with Dr. ${doctorName} is confirmed.`,
        })
        setTimeout(() => {
          router.push("/dashboard/sessions")
        }, 2000)
      } else {
        const data = await res.json()
        const detail = data.detail || "Booking failed"

        if (res.status === 403 && detail.includes("subscription")) {
          toast.error("Subscription Required", {
            description:
              "A PhysioPass subscription is required to book sessions.",
          })
          router.push("/plans")
          return
        }

        toast.error("Booking Failed", { description: detail })
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  // Format selected date for display
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

  const formatTime = (time: string) => {
    const [h] = time.split(":").map(Number)
    const period = h >= 12 ? "PM" : "AM"
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${display}:00 ${period}`
  }

  // Success state
  if (bookingSuccess) {
    return (
      <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 mb-2">
            Booked Successfully!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Redirecting to your appointments…
          </p>
        </motion.div>
      </Card>
    )
  }

  return (
    <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden">
      {/* Fee */}
      <div className="mb-6 text-center">
        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
          Consultation Fee
        </div>
        <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 flex items-start justify-center">
          <span className="text-2xl mt-1.5 mr-1">₹</span>
          {consultationFee || 1500}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                s === step
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-110"
                  : s < step
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {s < step ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-6 h-0.5 rounded-full transition-colors ${
                  s < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Session Type ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
              Select Session Type
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {SESSION_TYPE_CONFIG.filter((t) =>
                availableSessionTypes.includes(t.id)
              ).map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    selectedType === type.id
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase">
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => step === 1 && selectedType && setStep(2)}
              disabled={!selectedType}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-40"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* ── Step 2: Date Picker ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
              Choose Date
            </h3>
            <div className="flex justify-center mb-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date ?? undefined)
                  setSelectedTime("")
                }}
                disabled={disabledDays}
                hidden={{ before: new Date() }}
                startMonth={new Date()}
                endMonth={(() => {
                  const d = new Date()
                  d.setMonth(d.getMonth() + 1)
                  return d
                })()}
                classNames={{
                  root: "text-sm",
                  months: "flex flex-col",
                  month_caption: "text-center font-black text-slate-900 dark:text-white mb-2",
                  nav: "flex justify-between mb-2",
                  button_previous: "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
                  button_next: "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
                  weekdays: "flex",
                  weekday: "w-10 text-center text-xs font-bold text-slate-400 py-1",
                  week: "flex",
                  day: "w-10 h-10 flex items-center justify-center",
                  day_button: "w-full h-full rounded-xl text-sm font-semibold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                  selected: "!bg-indigo-600 !text-white !rounded-xl shadow-md shadow-indigo-600/30",
                  disabled: "opacity-30 cursor-not-allowed",
                  today: "font-black text-indigo-600 dark:text-indigo-400",
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-2xl font-bold"
              >
                Back
              </Button>
              <Button
                onClick={() => selectedDate && setStep(3)}
                disabled={!selectedDate}
                className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Time Slots ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
              Pick a Time
            </h3>
            <p className="text-xs font-medium text-slate-500 mb-4">
              {selectedDate && formatDate(selectedDate)}
            </p>

            {availableTimeSlots.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">
                  No slots available for this date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-4 max-h-[200px] overflow-y-auto">
                {availableTimeSlots.map((slot) => (
                  <div
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-xl cursor-pointer border-2 transition-all text-sm font-bold ${
                      selectedTime === slot
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(slot)}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-2xl font-bold"
              >
                Back
              </Button>
              <Button
                onClick={() => selectedTime && setStep(4)}
                disabled={!selectedTime}
                className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">
              Confirm Booking
            </h3>

            <div className="space-y-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Doctor
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Dr. {doctorName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Session
                </span>
                <Badge className="capitalize bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold">
                  {selectedType}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Date
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedDate && formatDate(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Time
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {formatTime(selectedTime)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fee
                </span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  ₹{consultationFee || 1500}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1 h-12 rounded-2xl font-bold"
              >
                Back
              </Button>
              <Button
                onClick={handleBook}
                disabled={bookingLoading}
                className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Confirm & Book"
                )}
              </Button>
            </div>

            <p className="text-[11px] font-bold text-center text-slate-400 mt-4 uppercase tracking-wider">
              PhysioPass subscription required
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
