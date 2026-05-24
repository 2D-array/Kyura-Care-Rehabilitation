"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Eye, EyeOff, Activity } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Strict frontend validation: admin portal strictly permits admin@cura.reb
    const targetEmail = email.trim().toLowerCase()
    if (targetEmail !== "admin@cura.reb") {
      toast.error("Access Restricted: This route is reserved strictly for system platform administrators.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user && data.user.email === "admin@cura.reb") {
        toast.success("Administrator session authenticated successfully!")
        router.replace('/admin')
      } else {
        // Fallback safety logouts
        await supabase.auth.signOut()
        toast.error("Unauthorized: Role parameters are not elevated to admin status.")
      }
    } catch (err) {
      toast.error("Authentication server down. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }} 
        className="z-10 w-full max-w-[420px]"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">CuraReb</span>
        </Link>

        <Card className="p-8 rounded-[2rem] bg-slate-900/60 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
          
          <div className="text-center mb-8 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">Admin Console</h1>
            <p className="text-slate-400 text-xs font-semibold">Strict access gating for system administrators only</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Admin Email ID" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="rounded-2xl h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-600 font-semibold" 
              required 
              disabled={loading}
            />

            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Admin Passphrase" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="pr-12 rounded-2xl h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-600 font-semibold" 
                required 
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button 
              disabled={loading} 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg shadow-indigo-600/20 text-base transition-all active:scale-[0.98]"
            >
              {loading ? "Verifying Keys..." : "Access Dashboard"}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs font-semibold text-slate-500">
            For security audits, login trials are logged. <br/>
            <Link href="/" className="text-indigo-400 hover:underline mt-2 inline-block font-bold">Return to Main Website</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
