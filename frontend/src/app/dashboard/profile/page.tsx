"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Mail, ShieldCheck, Camera } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/patients/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile({ ...data, isPatient: true })
        } else {
          // try doctor
          const docRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors/me`, {
             headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (docRes.ok) {
            const docData = await docRes.json()
            setProfile({ ...docData, isPatient: false })
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return null

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl">
            <User className="w-10 h-10" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform">
            <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-slate-500 font-medium capitalize flex items-center gap-2">
            {profile?.role} Account
            {!profile?.isPatient && profile?.is_verified && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><ShieldCheck className="w-3 h-3 mr-1" /> Verified Specialist</Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Profile Information</h3>
          {profile?.isPatient ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-500 mb-1.5 block">Phone Number</label>
                  <Input defaultValue="" placeholder="+1 (555) 000-0000" className="rounded-xl h-12 bg-white dark:bg-slate-950" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-500 mb-1.5 block">Emergency Contact</label>
                  <Input defaultValue="" placeholder="Name & Number" className="rounded-xl h-12 bg-white dark:bg-slate-950" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-1.5 block">Primary Injury Type</label>
                <Input defaultValue="" placeholder="e.g. Lower Back, Knee Post-Op" className="rounded-xl h-12 bg-white dark:bg-slate-950" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-1.5 block">Medical History Notes</label>
                <Textarea placeholder="Brief medical history..." className="rounded-xl min-h-[120px] bg-white dark:bg-slate-950 resize-none" />
              </div>
              <Button className="rounded-xl font-bold px-8">Save Changes</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-500 mb-1.5 block">Short Bio</label>
                <Textarea defaultValue={profile?.bio || ""} placeholder="Tell patients about your expertise..." className="rounded-xl min-h-[120px] bg-white dark:bg-slate-950 resize-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-3 block">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-4 py-2 rounded-xl text-sm font-medium border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">Neurological</Badge>
                  <Badge variant="outline" className="px-4 py-2 rounded-xl text-sm font-medium border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Post-Surgery</Badge>
                  <Badge variant="outline" className="px-4 py-2 rounded-xl text-sm font-medium border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Orthopedic</Badge>
                </div>
              </div>
              <Button className="rounded-xl font-bold px-8 mt-4">Save Changes</Button>
            </div>
          )}
        </Card>

        <Card className="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-sm h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Security
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-500 mb-1.5 block">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{profile?.email}</span>
              </div>
            </div>
            
            {profile?.isPatient ? (
              <div>
                <label className="text-sm font-bold text-slate-500 mb-1.5 block">Membership Tier</label>
                <div className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold">Free Plan</span>
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">Basic</Badge>
                </div>
                <Button variant="link" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto mt-2 text-xs font-bold">Upgrade to Weekly</Button>
              </div>
            ) : (
              <div>
                <label className="text-sm font-bold text-slate-500 mb-1.5 block">Medical License</label>
                <div className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm">
                  {profile?.license_number}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
