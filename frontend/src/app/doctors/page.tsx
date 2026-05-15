"use client"

import { motion } from "framer-motion"
import { Check, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "Neuro Rehabilitation", fees: 120, online: true, verified: true, tags: ["Stroke Recovery", "Spinal Cord"] },
  { id: 2, name: "Dr. James Wilson", specialty: "Orthopedic", fees: 90, online: false, verified: true, tags: ["Post-Surgery", "Joint Pain"] },
  { id: 3, name: "Dr. Elena Rodriguez", specialty: "Sports Injury", fees: 150, online: true, verified: true, tags: ["ACL Rehab", "Performance"] },
  { id: 4, name: "Dr. Marcus Thorne", specialty: "Pediatric Physio", fees: 110, online: false, verified: false, tags: ["Developmental", "Mobility"] },
]

export default function DoctorDiscovery() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-72 shrink-0 space-y-8 z-10">
            <div className="sticky top-24 p-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
              <div className="flex items-center gap-2 mb-8 font-bold text-lg">
                <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Filters
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">Specialty</h4>
                  <div className="space-y-3">
                    {["Orthopedic", "Neuro Rehabilitation", "Sports Injury", "Pediatric Physio"].map(s => (
                      <div key={s} className="flex items-center space-x-3">
                        <Checkbox id={s} className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                        <label htmlFor={s} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-300">
                          {s}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">Max Consultation Fee</h4>
                  <Slider defaultValue={[150]} max={300} step={10} className="w-full [&_[role=slider]]:bg-indigo-600 [&_[role=slider]]:border-indigo-600" />
                  <div className="flex justify-between text-xs font-medium text-slate-500 mt-3">
                    <span>$50</span><span>$300+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <div className="relative group z-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
              <Input placeholder="Search by name or condition..." className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-600 text-base" />
            </div>

            <div className="grid gap-5">
              {MOCK_DOCTORS.map((doc, idx) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <Card className="p-6 rounded-[2rem] hover:scale-[1.02] transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -z-10" />
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 shadow-inner">
                          {doc.name.split(" ")[1].charAt(0)}
                        </div>
                        {doc.online && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{doc.name}</h3>
                          {doc.verified && (
                            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-semibold shadow-sm">
                              <Check className="w-3.5 h-3.5 mr-1" strokeWidth={3} /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{doc.specialty}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {doc.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                        <div className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">${doc.fees}</div>
                        <div className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">per session</div>
                        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto font-semibold px-8 shadow-md hover:shadow-lg transition-all">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
