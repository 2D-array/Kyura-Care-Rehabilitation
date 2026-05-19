"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Activity, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Resolve role before navigating so post-login landing is deterministic.
    if (data.session) {
      let userRole = data.user?.user_metadata?.role || "patient"
      try {
        const profileRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        })
        
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          userRole = profileData.role || userRole
        } else {
          // If profile doesn't exist, it means they need to be synced
          if (userRole) {
            const syncRes = await fetch(`${apiUrl}/api/v1/auth/sync-profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`
              },
              body: JSON.stringify({
                role: userRole,
                first_name: data.user?.user_metadata?.first_name || "",
                last_name: data.user?.user_metadata?.last_name || "",
                license_number: data.user?.user_metadata?.license_number || null
              })
            })
            if (syncRes.ok) {
              const syncedProfile = await syncRes.json()
              userRole = syncedProfile.role || userRole
            }
          }
        }
      } catch (err) {
        // Silent fail — user still gets into dashboard
        console.error('Profile sync on login failed:', err)
      }

      if (userRole === "patient") {
        router.replace('/')
      } else {
        router.replace('/dashboard')
      }
      return
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="z-10 w-full max-w-[420px]">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">CuraReb</span>
        </Link>
        <Card className="p-8 rounded-[2rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
          <div className="text-center mb-8 pt-2">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Log in to your CuraReb account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
              className="rounded-2xl h-14 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 focus-visible:ring-indigo-600 font-medium" required />
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="pr-12 rounded-2xl h-14 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 focus-visible:ring-indigo-600 font-medium" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Button disabled={loading} type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 text-base transition-all active:scale-[0.98]">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Create one</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
