"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createBrowserClient } from '@supabase/ssr'
import {
  Star, MapPin, Clock, Calendar, Video, Home as HomeIcon,
  Building2, Check, User, ShieldCheck, Award, MessageCircle, ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/context/UserContext"

export default function DoctorProfile() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile } = useUser()

  const [doctor, setDoctor] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Booking State
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSessionType, setSelectedSessionType] = useState<string>("online")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState("")

  // Review State
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  // Generate next 7 days for the calendar
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1) // Start from tomorrow
    return d.toISOString().split('T')[0]
  })

  useEffect(() => {
    if (id) {
      fetchDoctorData()
      fetchReviews()
    }
  }, [id])

  const fetchDoctorData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDoctor(data)
      } else {
        router.push("/doctors") // redirect if not found
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${id}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBook = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!selectedDate) {
      setBookingError("Please select a date")
      return
    }
    
    setBookingLoading(true)
    setBookingError("")
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          doctor_id: id,
          appointment_date: `${selectedDate}T09:00:00Z`, // Defaulting time for now
          session_type: selectedSessionType
        })
      })

      if (res.ok) {
        setBookingSuccess(true)
      } else {
        const data = await res.json()
        setBookingError(data.detail || "Booking failed")
      }
    } catch (err) {
      setBookingError("An error occurred. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!rating) return

    setReviewLoading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          doctor_id: id,
          rating,
          comment
        })
      })

      if (res.ok) {
        setComment("")
        setRating(5)
        fetchReviews() // refresh
      }
    } catch (err) {
      console.error(err)
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 px-4 pb-20">
        <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-64 w-full rounded-[2rem]" />
            <Skeleton className="h-40 w-full rounded-[2rem]" />
          </div>
          <div className="w-full lg:w-96">
            <Skeleton className="h-96 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) return null

  const dProfile = doctor.profiles || {}
  const fullName = `Dr. ${dProfile.first_name || ""} ${dProfile.last_name || ""}`.trim()
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "New"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent -z-10" />

      <div className="container max-w-6xl mx-auto px-4 pt-24 pb-20">
        
        {/* Back button */}
        <button 
          onClick={() => router.push("/doctors")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Specialists
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-8">
            
            {/* ── HERO PROFILE CARD ── */}
            <Card className="p-8 md:p-10 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -z-10" />
              
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl">
                    {dProfile.first_name?.[0] || 'D'}{dProfile.last_name?.[0] || 'R'}
                  </div>
                  {doctor.is_verified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {fullName}
                    </h1>
                    {doctor.is_verified && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-3 py-1 text-xs">
                        <Check className="w-3 h-3 mr-1" strokeWidth={3} /> Verified Specialist
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mb-4">{doctor.specialty || 'General Physiotherapy'}</p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span>{avgRating} <span className="text-slate-400 font-medium">({reviews.length} reviews)</span></span>
                    </div>
                    {doctor.years_of_experience && (
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Award className="w-5 h-5 text-purple-500" />
                        <span>{doctor.years_of_experience} Years Exp.</span>
                      </div>
                    )}
                    {doctor.clinic_name && (
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <span>{doctor.clinic_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── ABOUT SECTION ── */}
            <Card className="p-8 md:p-10 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">About Dr. {dProfile.last_name}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                {doctor.bio || "No biography provided yet."}
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctor.education_details && (
                  <div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Education & Qualifications</h3>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctor.education_details}</p>
                  </div>
                )}
                {doctor.languages_spoken && (
                  <div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Languages Spoken</h3>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctor.languages_spoken}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── REVIEWS SECTION ── */}
            <Card className="p-8 md:p-10 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-indigo-500" /> Patient Reviews
                </h2>
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold border border-amber-200 dark:border-amber-800">
                  <Star className="w-4 h-4 fill-amber-500" /> {avgRating}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-6 mb-10">
                {reviews.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-6">No reviews yet. Be the first to leave one!</p>
                ) : (
                  reviews.map((r, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black">
                            {r.patients?.profiles?.first_name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {r.patients?.profiles?.first_name || 'Anonymous Patient'}
                            </div>
                            <div className="text-xs text-slate-500">Verified Patient</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, si) => (
                            <Star key={si} className={`w-3.5 h-3.5 ${si < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{r.comment}"
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Leave Review Form (If Patient) */}
              {profile?.role === "patient" && (
                <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4">Leave a Review</h3>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={`w-8 h-8 cursor-pointer transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700 hover:text-amber-200'}`} 
                      />
                    ))}
                  </div>
                  <Textarea 
                    placeholder="Share your experience with this doctor..." 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="mb-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold"
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              )}
            </Card>

          </div>

          {/* Sidebar Booking Card (Right) */}
          <aside className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-28">
              <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden">
                <div className="mb-6 text-center">
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Consultation Fee</div>
                  <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 flex items-start justify-center">
                    <span className="text-2xl mt-1.5 mr-1">$</span>
                    {doctor.consultation_fee || 150}
                  </div>
                </div>

                {/* Session Type */}
                <div className="mb-6">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Select Session Type</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "online", label: "Online", icon: Video },
                      { id: "in-clinic", label: "Clinic", icon: Building2 },
                      { id: "at-home", label: "Home", icon: HomeIcon },
                    ].map(type => (
                      <div 
                        key={type.id}
                        onClick={() => setSelectedSessionType(type.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer border-2 transition-all ${
                          selectedSessionType === type.id 
                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300"
                            : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-[11px] font-bold uppercase">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Picker (Calendar) */}
                <div className="mb-8">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Available Dates</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {next7Days.map(dateStr => {
                      const d = new Date(dateStr)
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                      const dayNum = d.getDate()
                      return (
                        <div
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex flex-col items-center p-2 rounded-2xl cursor-pointer border-2 transition-all ${
                            selectedDate === dateStr
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                              : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase ${selectedDate === dateStr ? 'text-indigo-100' : 'text-slate-400'}`}>{dayName}</span>
                          <span className="text-lg font-black">{dayNum}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action */}
                {bookingSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-2xl text-center animate-in fade-in zoom-in">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="font-black text-emerald-700 dark:text-emerald-400 text-lg mb-1">Request Sent!</h3>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 font-medium">The doctor will confirm shortly.</p>
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div className="mb-4 text-xs font-bold text-red-500 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        {bookingError}
                      </div>
                    )}
                    <Button 
                      onClick={handleBook}
                      disabled={bookingLoading}
                      className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
                    >
                      {bookingLoading ? "Requesting..." : "Request Appointment"}
                    </Button>
                    <p className="text-[11px] font-bold text-center text-slate-400 mt-4 uppercase tracking-wider">No charge until confirmed</p>
                  </>
                )}
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
