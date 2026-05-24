"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Star, MapPin, Clock, Calendar, Video, Home as HomeIcon,
  Building2, Check, User, ShieldCheck, Award, MessageCircle,
  ChevronLeft, Globe, GraduationCap, Languages
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/context/UserContext"
import { BookingWidget } from "@/components/booking-widget"
import { StarRating, StarDistribution } from "@/components/star-rating"

interface Review {
  id: string
  rating: number
  comment?: string
  created_at?: string
  patient_first_name?: string
  patient_last_initial?: string
  patient_avatar_url?: string
}

export default function DoctorProfile() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile } = useUser()

  const [doctor, setDoctor] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewPage, setReviewPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(false)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)

  // Review form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchDoctorData()
      fetchReviews(1, true)
    }
  }, [id])

  const fetchDoctorData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDoctor(data)
      } else {
        router.push("/doctors")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (page: number, reset = false) => {
    try {
      if (!reset) setLoadingMoreReviews(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/${id}/reviews?page=${page}&limit=10`
      )
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setReviews(data.reviews)
        } else {
          setReviews(prev => [...prev, ...data.reviews])
        }
        setHasMoreReviews(data.has_more)
        setReviewPage(page)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMoreReviews(false)
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
      const { createBrowserClient } = await import("@supabase/ssr")
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
        // Optimistically update
        const newReview: Review = {
          id: crypto.randomUUID(),
          rating,
          comment,
          created_at: new Date().toISOString(),
          patient_first_name: profile?.first_name || "You",
          patient_last_initial: profile?.last_name?.[0] ? `${profile.last_name[0]}.` : "",
        }
        setReviews(prev => [newReview, ...prev])
        // Refresh doctor data to get updated stats
        fetchDoctorData()
        const { toast } = await import("sonner")
        toast.success("Review submitted!", { description: "Thank you for your feedback." })
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
  const fullName = `${dProfile.first_name || ""} ${dProfile.last_name || ""}`.trim()
  const avgRating = doctor.average_rating || 0
  const reviewCount = doctor.review_count || 0

  // Determine available session types
  const sessionTypes = doctor.available_session_types?.length > 0
    ? doctor.available_session_types
    : ["online", "in-clinic", "at-home"]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

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
            <motion.div {...fadeInUp}>
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
                        Dr. {fullName}
                      </h1>
                      {doctor.is_verified && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-3 py-1 text-xs">
                          <Check className="w-3 h-3 mr-1" strokeWidth={3} /> Verified Specialist
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mb-4">{doctor.specialty || 'General Physiotherapy'}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm font-semibold mb-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>{avgRating > 0 ? avgRating.toFixed(1) : "New"} <span className="text-slate-400 font-medium">({reviewCount} reviews)</span></span>
                      </div>
                      {(doctor.years_of_experience || doctor.years_experience) && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Award className="w-5 h-5 text-purple-500" />
                          <span>{doctor.years_of_experience || doctor.years_experience} Years Exp.</span>
                        </div>
                      )}
                      {doctor.clinic_name && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <span>{doctor.clinic_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Session type badges */}
                    <div className="flex flex-wrap gap-2">
                      {sessionTypes.includes("online") && (
                        <Badge variant="outline" className="rounded-xl px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold">
                          <Video className="w-3 h-3 mr-1" /> Online
                        </Badge>
                      )}
                      {sessionTypes.includes("in-clinic") && (
                        <Badge variant="outline" className="rounded-xl px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">
                          <Building2 className="w-3 h-3 mr-1" /> In-Clinic
                        </Badge>
                      )}
                      {sessionTypes.includes("at-home") && (
                        <Badge variant="outline" className="rounded-xl px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                          <HomeIcon className="w-3 h-3 mr-1" /> At-Home
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ── ABOUT SECTION ── */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-8 md:p-10 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">About Dr. {dProfile.last_name || dProfile.first_name}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {doctor.bio || "No biography provided yet."}
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(doctor.education_details || doctor.education) && (
                    <div className="flex gap-3">
                      <GraduationCap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Education & Qualifications</h3>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctor.education_details || doctor.education}</p>
                      </div>
                    </div>
                  )}
                  {doctor.languages_spoken && (
                    <div className="flex gap-3">
                      <Languages className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Languages Spoken</h3>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">
                          {Array.isArray(doctor.languages_spoken)
                            ? doctor.languages_spoken.join(", ")
                            : doctor.languages_spoken}
                        </p>
                      </div>
                    </div>
                  )}
                  {doctor.clinic_address && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Clinic Location</h3>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctor.clinic_address}</p>
                      </div>
                    </div>
                  )}
                  {doctor.available_days && (
                    <div className="flex gap-3">
                      <Calendar className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Availability</h3>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctor.available_days}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* ── REVIEWS SECTION ── */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="p-8 md:p-10 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-indigo-500" /> Patient Reviews
                  </h2>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold border border-amber-200 dark:border-amber-800">
                    <Star className="w-4 h-4 fill-amber-500" /> {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                  </div>
                </div>

                {/* Star Distribution Chart */}
                {reviews.length > 0 && (
                  <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <StarDistribution reviews={reviews} />
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-4 mb-8">
                  {reviews.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-6">No reviews yet. Be the first to leave one!</p>
                  ) : (
                    reviews.map((r, i) => (
                      <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black">
                              {r.patient_first_name?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm">
                                {r.patient_first_name || 'Anonymous'} {r.patient_last_initial || ''}
                              </div>
                              <div className="text-xs text-slate-500">
                                {r.created_at
                                  ? new Date(r.created_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Verified Patient"}
                              </div>
                            </div>
                          </div>
                          <StarRating value={r.rating} readonly size="sm" />
                        </div>
                        {r.comment && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            &ldquo;{r.comment}&rdquo;
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Load More */}
                {hasMoreReviews && (
                  <div className="text-center mb-8">
                    <Button
                      variant="outline"
                      onClick={() => fetchReviews(reviewPage + 1)}
                      disabled={loadingMoreReviews}
                      className="rounded-2xl font-bold px-8"
                    >
                      {loadingMoreReviews ? "Loading..." : "Load More Reviews"}
                    </Button>
                  </div>
                )}

                {/* Leave Review Form (If Patient) */}
                {profile?.role === "patient" && (
                  <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="font-black text-slate-900 dark:text-white mb-4">Leave a Review</h3>
                    <div className="mb-4">
                      <StarRating value={rating} onChange={setRating} size="lg" />
                    </div>
                    <textarea
                      placeholder="Share your experience with this doctor..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="w-full mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            </motion.div>

          </div>

          {/* Sidebar Booking Widget (Right) */}
          <aside className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-28">
              <BookingWidget
                doctorId={doctor.id}
                doctorName={fullName}
                consultationFee={doctor.consultation_fee}
                availableSessionTypes={sessionTypes}
              />
              
              {/* Mobile-only sticky CTA */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50">
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20"
                >
                  Book Appointment — ₹{doctor.consultation_fee || 1500}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
