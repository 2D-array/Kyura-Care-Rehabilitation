"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Activity, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export default function SignupPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (role === "doctor" && !licenseNumber) {
        toast.error("Medical License Number is required for specialists.")
        setLoading(false)
        return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    })
    
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      try {
        const syncRes = await fetch(`${apiUrl}/api/v1/auth/sync-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({ role, first_name: firstName, last_name: lastName, license_number: licenseNumber })
        })
        if (!syncRes.ok) {
          throw new Error("Profile sync failed")
        }
      } catch {}

      if (role === "patient") {
        router.replace('/')
      } else {
        router.replace('/dashboard')
      }
      return
    }

    setLoading(false)
    toast.success("Account created! Check your email to confirm.")
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#020617] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-[420px]"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">CuraReb</span>
        </Link>

        <Card className="p-8 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
          
          <div className="text-center mb-6 pt-2">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
              Create Account
            </h1>
          </div>

          <div className="flex p-1 mb-6 bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl relative shadow-inner border border-slate-200/50 dark:border-white/5">
            <motion.div 
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.2)]"
              animate={{ x: role === "patient" ? 4 : "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button 
              type="button"
              className={`flex-1 py-3 text-sm font-bold z-10 transition-colors rounded-xl ${role === "patient" ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              onClick={() => setRole("patient")}
            >
              Patient
            </button>
            <button 
              type="button"
              className={`flex-1 py-3 text-sm font-bold z-10 transition-colors rounded-xl ${role === "doctor" ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              onClick={() => setRole("doctor")}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="First Name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-2xl h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 font-medium"
                required
              />
              <Input 
                placeholder="Last Name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-2xl h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 font-medium"
                required
              />
            </div>
            
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 font-medium"
              required
            />
            
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 rounded-2xl h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 font-medium"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {role === "doctor" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <Input 
                      placeholder="Medical License Number" 
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="rounded-2xl h-12 bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 font-medium"
                      required={role === "doctor"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button disabled={loading} type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 text-md transition-all mt-4">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account? <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Sign In</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
