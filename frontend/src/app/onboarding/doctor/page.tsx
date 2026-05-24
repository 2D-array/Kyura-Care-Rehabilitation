"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Stethoscope, User, Calendar, Award, Building, DollarSign, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

export default function DoctorOnboardingPage() {
  const { profile, updateProfile } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form states
  const [specialty, setSpecialty] = useState("")
  const [education, setEducation] = useState("")
  const [experience, setExperience] = useState<number>(3)
  const [fee, setFee] = useState<number>(500)
  const [bio, setBio] = useState("")
  const [clinicName, setClinicName] = useState("")
  const [clinicAddress, setClinicAddress] = useState("")
  const [license, setLicense] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!specialty || !education || !license || !bio) {
      toast.error("Please complete all required fields.")
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        specialty,
        education_details: education,
        years_of_experience: Number(experience),
        consultation_fee: Number(fee),
        bio,
        clinic_name: clinicName,
        clinic_address: clinicAddress,
        license_number: license,
        profile_completed: true
      })

      toast.success("Profile submitted successfully! Placed in verification queue. 🎉")
      router.push("/dashboard")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to submit onboarding details.")
    } finally {
      setSaving(false)
    }
  }

  if (profile?.role !== "doctor") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Patient Portal</h2>
        <p className="text-slate-500 max-w-sm">This onboarding form is reserved for physiotherapist accounts.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 relative overflow-hidden">
      
      {/* Decorative blurs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Practice Onboarding
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            Set Up Your <span className="text-indigo-600 dark:text-indigo-400">Professional Profile</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium"
          >
            Submit your clinical details to activate your marketplace listing.
          </motion.p>
        </div>

        {/* Onboarding Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <h3 className="text-base font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                <Stethoscope className="w-5 h-5" /> Professional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Specialty / Category *</label>
                  <Input
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    placeholder="e.g. Ortho Physio, Neuro Rehab"
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                    required
                  />
                </div>

                {/* Medical License */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Medical License ID *</label>
                  <Input
                    value={license}
                    onChange={e => setLicense(e.target.value)}
                    placeholder="e.g. REG-12345ABC"
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                    required
                  />
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Education Details *</label>
                  <Input
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    placeholder="e.g. BPT, MPT (Neurology)"
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                    required
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Years of Experience *</label>
                  <Input
                    type="number"
                    value={experience}
                    onChange={e => setExperience(Number(e.target.value))}
                    min={0}
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                    required
                  />
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Consultation Fee (INR) *</label>
                  <Input
                    type="number"
                    value={fee}
                    onChange={e => setFee(Number(e.target.value))}
                    min={0}
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                    required
                  />
                </div>
              </div>

              {/* Bio Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Professional Bio *</label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Introduce yourself, your practice methods, and your recovery focus..."
                  className="rounded-xl bg-white dark:bg-slate-950 min-h-[100px]"
                  required
                />
              </div>

              <hr className="border-slate-200/55 dark:border-white/5 my-6" />

              <h3 className="text-base font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                <Building className="w-5 h-5" /> Clinic Information (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Clinic Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Clinic Name</label>
                  <Input
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="e.g. Apex Health Center"
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                  />
                </div>

                {/* Clinic Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Clinic Address</label>
                  <Input
                    value={clinicAddress}
                    onChange={e => setClinicAddress(e.target.value)}
                    placeholder="e.g. 12 Ring Road, Bengaluru"
                    className="h-11 rounded-xl bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold gap-1.5 shadow-lg shadow-indigo-600/25 mt-4"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Application <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
