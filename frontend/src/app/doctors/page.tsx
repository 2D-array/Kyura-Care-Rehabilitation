"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { motion } from "framer-motion"
import { Check, Search, Filter, Star, DollarSign, Calendar, Video, Home as HomeIcon, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { createBrowserClient } from '@supabase/ssr'
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type DoctorProfile = {
  first_name?: string
  last_name?: string
}

type Doctor = {
  id: string
  profiles?: DoctorProfile
  specialty?: string
  bio?: string
  consultation_fee?: number
  years_of_experience?: number
  available_days?: string
  is_verified?: boolean
  average_rating?: number
  review_count?: number
  available_session_types?: string[]
}

const CATEGORIES = [
  {
    slug: "ortho",
    label: "Ortho Physio",
    specialties: ["Orthopedic", "Orthopedic Therapy", "Ortho Physio"],
    terms: ["ortho", "orthopedic", "joint", "fracture", "arthritis", "post surgery", "post-surgery"]
  },
  {
    slug: "neuro",
    label: "Neuro Rehab",
    specialties: ["Neurological Rehabilitation", "Neuro Rehab"],
    terms: ["neuro", "neurological", "stroke", "spinal", "parkinson", "multiple sclerosis"]
  },
  {
    slug: "cardiac",
    label: "Cardiac Rehab",
    specialties: ["Cardiac Rehabilitation", "Cardiac Rehab"],
    terms: ["cardiac", "heart", "cardio"]
  },
  {
    slug: "sports",
    label: "Sports Injury",
    specialties: ["Sports Injury", "Sports Injury Recovery"],
    terms: ["sports", "acl", "rotator", "ankle", "athlete", "performance"]
  },
  {
    slug: "pain",
    label: "Pain Management",
    specialties: ["Chronic Pain Management", "Pain Management"],
    terms: ["pain", "chronic pain", "back pain", "fibromyalgia", "headache"]
  },
  {
    slug: "natal",
    label: "Pre/Post Natal",
    specialties: ["Pre/Post Natal", "Women's Health", "Maternity Physiotherapy"],
    terms: ["natal", "prenatal", "postnatal", "pregnancy", "maternity", "pelvic"]
  },
  {
    slug: "geriatric",
    label: "Geriatric",
    specialties: ["Geriatric", "Geriatric Care"],
    terms: ["geriatric", "elderly", "senior", "balance", "fall"]
  },
  {
    slug: "yoga",
    label: "Yoga Therapy",
    specialties: ["Yoga Therapy", "Therapeutic Yoga"],
    terms: ["yoga", "mobility", "flexibility", "breathing"]
  }
]

function DoctorDiscoveryContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("spec") || ""
  const query = searchParams.get("q") || ""
  const category = CATEGORIES.find(item => item.slug === categorySlug)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [maxFee, setMaxFee] = useState([300])
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)

  const fetchDoctors = useCallback(async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/`, { headers })
      if (res.ok) {
        const data = await res.json()
        setDoctors(data)
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchDoctors()
    }, 0)

    return () => window.clearTimeout(id)
  }, [fetchDoctors])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchQuery(query)
      setSelectedSpecialties(category?.specialties || [])
    }, 0)

    return () => window.clearTimeout(id)
  }, [category?.specialties, categorySlug, query])

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const filteredDoctors = doctors.filter(doc => {
    const specialty = doc.specialty?.toLowerCase() || ""
    const bio = doc.bio?.toLowerCase() || ""
    const categoryTerms = category?.terms || []

    const matchesSearch = searchQuery === "" || 
      `${doc.profiles?.first_name} ${doc.profiles?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.includes(searchQuery.toLowerCase()) ||
      bio.includes(searchQuery.toLowerCase())
    
    const matchesSpecialty = selectedSpecialties.length === 0 || 
      selectedSpecialties.some(selected => specialty.includes(selected.toLowerCase())) ||
      categoryTerms.some(term => specialty.includes(term) || bio.includes(term))
    
    const matchesFee = !doc.consultation_fee || doc.consultation_fee <= maxFee[0]
    
    return matchesSearch && matchesSpecialty && matchesFee
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent -z-10" />
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              {category ? category.label : "Find Your"} <span className="text-indigo-600 dark:text-indigo-400">{category ? "Specialists" : "Specialist"}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {category
                ? "Browse verified physiotherapists filtered for this recovery need."
                : "Connect with verified physiotherapists specialized in your recovery needs"}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <div className="flex items-center gap-2 mb-6 font-black text-xl text-slate-900 dark:text-white">
                  <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Filters
                </div>
                
                <div className="space-y-6">
                  {/* Specialty Filter */}
                  <div>
                    <h4 className="text-sm font-black mb-4 text-slate-900 dark:text-white uppercase tracking-wide">Specialty</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {CATEGORIES.map(({ label, specialties }) => {
                        const specialty = specialties[0]
                        return (
                        <div key={specialty} className="flex items-center space-x-3">
                          <Checkbox 
                            id={specialty} 
                            checked={selectedSpecialties.some(selected => specialties.includes(selected))}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                            className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" 
                          />
                          <label 
                            htmlFor={specialty} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            {label}
                          </label>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Fee Range */}
                  <div>
                    <h4 className="text-sm font-black mb-4 text-slate-900 dark:text-white uppercase tracking-wide">Max Consultation Fee</h4>
                    <Slider 
                      value={maxFee} 
                      onValueChange={(value) => setMaxFee(Array.isArray(value) ? value : [value])}
                      max={500} 
                      step={10} 
                      className="w-full [&_[role=slider]]:bg-indigo-600 [&_[role=slider]]:border-indigo-600" 
                    />
                    <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-400 mt-3">
                      <span>$0</span>
                      <span className="text-indigo-600 dark:text-indigo-400">${maxFee[0]}</span>
                      <span>$500+</span>
                    </div>
                  </div>

                  {/* Online Only */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="online-only" 
                        checked={showOnlineOnly}
                        onCheckedChange={(checked) => setShowOnlineOnly(checked as boolean)}
                        className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" 
                      />
                      <label 
                        htmlFor="online-only" 
                        className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Online Consultations Only
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedSpecialties.length > 0 || maxFee[0] < 300 || showOnlineOnly) && (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-2xl font-bold"
                      onClick={() => {
                        setSelectedSpecialties([])
                        setMaxFee([300])
                        setShowOnlineOnly(false)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                placeholder="Search by name, specialty, or condition..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 rounded-[2rem] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg focus-visible:ring-indigo-600 text-base font-medium" 
              />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {loading ? "Loading..." : `${filteredDoctors.length} specialist${filteredDoctors.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Doctors Grid */}
            <div className="grid gap-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6 rounded-[2rem]">
                    <div className="flex gap-6">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : filteredDoctors.length === 0 ? (
                <Card className="p-12 rounded-[2rem] text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                    No specialists found matching your criteria. Try adjusting your filters.
                  </p>
                </Card>
              ) : (
                filteredDoctors.map((doc, idx) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <Card className="group p-8 rounded-[2rem] hover:scale-[1.01] transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -z-10" />
                      
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                            {doc.profiles?.first_name?.[0] || 'D'}{doc.profiles?.last_name?.[0] || 'R'}
                          </div>
                          {doc.is_verified && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                Dr. {doc.profiles?.first_name} {doc.profiles?.last_name}
                              </h3>
                              {doc.is_verified && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                                  <Check className="w-3 h-3 mr-1" strokeWidth={3} /> Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{doc.specialty || 'General Physiotherapy'}</p>
                          </div>
                          
                          {doc.bio && (
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                              {doc.bio}
                            </p>
                          )}

                          {/* Details */}
                          <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {(doc.average_rating ?? 0) > 0 ? (doc.average_rating ?? 0).toFixed(1) : "New"}
                              </span>
                              <span className="text-slate-400 font-medium">({doc.review_count ?? 0} reviews)</span>
                            </div>
                            {doc.years_of_experience && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span className="font-bold text-slate-700 dark:text-slate-300">{doc.years_of_experience} years exp.</span>
                              </div>
                            )}
                          </div>

                          {/* Session Types */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="rounded-xl px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                              <Video className="w-3 h-3 mr-1" /> Online
                            </Badge>
                            <Badge variant="outline" className="rounded-xl px-3 py-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                              <Building2 className="w-3 h-3 mr-1" /> In-Clinic
                            </Badge>
                            <Badge variant="outline" className="rounded-xl px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                              <HomeIcon className="w-3 h-3 mr-1" /> At-Home
                            </Badge>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="text-left lg:text-right w-full lg:w-auto lg:min-w-[180px] pt-6 lg:pt-0 border-t lg:border-0 border-slate-200 dark:border-slate-800">
                          <div className="mb-4">
                            <div className="text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 flex items-start gap-1 justify-start lg:justify-end">
                              <DollarSign className="w-6 h-6 mt-1" />
                              {doc.consultation_fee || 150}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">per session</div>
                          </div>
                          <Link href={`/doctors/${doc.id}`}>
                            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white w-full lg:w-auto font-bold px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function DoctorDiscovery() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <DoctorDiscoveryContent />
    </Suspense>
  )
}
