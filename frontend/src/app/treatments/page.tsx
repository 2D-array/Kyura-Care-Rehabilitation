"use client"

import { motion } from "framer-motion"
import { Activity, Brain, Bone, Heart, Zap, Users, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const TREATMENTS = [
  {
    icon: Brain,
    title: "Neurological Rehabilitation",
    description: "Specialized care for stroke recovery, spinal cord injuries, and neurological conditions.",
    features: ["Stroke Recovery", "Spinal Cord Injury", "Parkinson's Management", "Multiple Sclerosis"],
    duration: "8-12 weeks",
    sessions: "3-5 per week",
    color: "indigo"
  },
  {
    icon: Bone,
    title: "Orthopedic Therapy",
    description: "Post-surgery rehabilitation and treatment for musculoskeletal conditions.",
    features: ["Joint Replacement", "Fracture Recovery", "Arthritis Management", "Sports Injuries"],
    duration: "6-10 weeks",
    sessions: "2-4 per week",
    color: "emerald"
  },
  {
    icon: Heart,
    title: "Cardiac Rehabilitation",
    description: "Comprehensive recovery program for heart attack and cardiac surgery patients.",
    features: ["Post-Heart Attack", "Cardiac Surgery", "Heart Failure", "Exercise Training"],
    duration: "12-16 weeks",
    sessions: "3 per week",
    color: "rose"
  },
  {
    icon: Zap,
    title: "Sports Injury Recovery",
    description: "Fast-track rehabilitation for athletes and active individuals.",
    features: ["ACL Reconstruction", "Rotator Cuff", "Ankle Sprains", "Performance Training"],
    duration: "4-8 weeks",
    sessions: "4-6 per week",
    color: "amber"
  },
  {
    icon: Users,
    title: "Pediatric Physiotherapy",
    description: "Specialized care for children with developmental and mobility challenges.",
    features: ["Developmental Delays", "Cerebral Palsy", "Torticollis", "Gait Training"],
    duration: "Ongoing",
    sessions: "2-3 per week",
    color: "purple"
  },
  {
    icon: Activity,
    title: "Chronic Pain Management",
    description: "Long-term strategies for managing persistent pain conditions.",
    features: ["Lower Back Pain", "Fibromyalgia", "Chronic Headaches", "Arthritis Pain"],
    duration: "12+ weeks",
    sessions: "2-3 per week",
    color: "cyan"
  }
]

const BENEFITS = [
  { icon: Clock, title: "Flexible Scheduling", desc: "Book sessions that fit your lifestyle" },
  { icon: Award, title: "Expert Specialists", desc: "Board-certified physiotherapists" },
  { icon: Heart, title: "Personalized Plans", desc: "Tailored to your specific needs" },
  { icon: Zap, title: "Fast Results", desc: "Evidence-based treatment protocols" }
]

export default function TreatmentsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-6 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-sm font-bold">
              Comprehensive Care Programs
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Treatment <span className="text-indigo-600 dark:text-indigo-400">Specialties</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Evidence-based physiotherapy programs designed to accelerate your recovery and restore your quality of life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/doctors">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Find a Specialist
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-lg font-bold border-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Treatments Grid */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TREATMENTS.map((treatment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="group p-8 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                  <div className={`w-16 h-16 rounded-2xl bg-${treatment.color}-100 dark:bg-${treatment.color}-900/30 flex items-center justify-center mb-6 text-${treatment.color}-600 dark:text-${treatment.color}-400 shadow-lg group-hover:scale-110 transition-transform`}>
                    <treatment.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">
                    {treatment.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {treatment.description}
                  </p>
                  
                  <div className="space-y-3 mb-6 flex-grow">
                    {treatment.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${treatment.color}-500`}></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Duration:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{treatment.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Sessions:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{treatment.sessions}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                    Learn More
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-purple-900">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Choose CuraReb?
            </h2>
            <p className="text-xl text-indigo-100 dark:text-indigo-200 max-w-2xl mx-auto">
              Premium physiotherapy care designed around your needs
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{benefit.title}</h3>
                <p className="text-indigo-100 dark:text-indigo-200">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] bg-slate-100 dark:bg-slate-900 p-12 md:p-16 text-center overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                Not Sure Which Treatment You Need?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Our specialists can help you determine the best treatment plan for your specific condition.
              </p>
              <Link href="/doctors">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Consult a Specialist
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
