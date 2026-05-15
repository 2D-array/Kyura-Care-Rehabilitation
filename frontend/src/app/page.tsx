"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Home as HomeIcon } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-32 pb-20 px-4 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent -z-10" />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 z-[-5] opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
        
        {/* Soft Blurred Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex-1 text-center md:text-left space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-50 leading-tight">
              Recovery <br/><span className="text-indigo-600 dark:text-indigo-400">Starts Here.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto md:mx-0">
              Premium post-accident rehabilitation and long-term care tailored to you. Connect with elite specialists today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link href="/doctors">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 hover:scale-105 transition-transform shadow-xl shadow-indigo-600/20">
                  Find a Specialist
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 hover:scale-105 transition-transform bg-white/50 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                  Patient Portal
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }}
            className="flex-1 w-full relative"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/10 dark:shadow-indigo-900/40 border border-white/60 dark:border-white/10 aspect-square max-w-md mx-auto bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 backdrop-blur-xl flex items-center justify-center"
            >
              <Activity className="w-40 h-40 text-indigo-500 opacity-80" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md">
        <div className="container mx-auto text-center px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">Trusted by 50+ Specialized Physiotherapists</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-xl font-bold font-mono tracking-tighter">NEURO<span className="text-indigo-600">REHAB</span></div>
            <div className="text-xl font-bold font-mono tracking-tighter">ORTHO<span className="text-emerald-500">CARE</span></div>
            <div className="text-xl font-bold font-mono tracking-tighter">SPINE<span className="text-indigo-600">FLEX</span></div>
            <div className="text-xl font-bold font-mono tracking-tighter">ELITE<span className="text-emerald-500">PHYSIO</span></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">Our Care Pathways</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Online Consultation", desc: "Expert assessment and triage from anywhere via high-quality video sessions." },
              { icon: Heart, title: "Physical Therapy", desc: "In-clinic advanced equipment and hands-on manipulation for rapid recovery." },
              { icon: HomeIcon, title: "At-Home Care", desc: "Specialists come to you for comfortable, effective long-term rehabilitation." }
            ].map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.03, y: -5 }}
                className="p-8 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
