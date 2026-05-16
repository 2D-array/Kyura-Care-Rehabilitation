"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, ShieldCheck, Camera, AlertCircle, CheckCircle2, History, Settings, Save } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useUser()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        // Patient fields
        emergency_contact: profile.emergency_contact || "",
        date_of_birth: profile.date_of_birth || "",
        address: profile.address || "",
        primary_injury: profile.primary_injury || "",
        medical_history: profile.medical_history || "",
        gender: profile.gender || "",
        blood_group: profile.blood_group || "",
        insurance_provider: profile.insurance_provider || "",
        // Doctor fields
        bio: profile.bio || "",
        specialty: profile.specialty || "",
        education_details: profile.education_details || "",
        years_of_experience: profile.years_of_experience || "",
        consultation_fee: profile.consultation_fee || "",
        available_days: profile.available_days || "",
        available_hours: profile.available_hours || "",
        clinic_name: profile.clinic_name || "",
        clinic_address: profile.clinic_address || "",
        languages_spoken: profile.languages_spoken || "",
      })
    }
  }, [profile])

  const set = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleSave = async (fields?: string[]) => {
    setSaving(true)
    try {
      const payload = fields
        ? Object.fromEntries(fields.map(f => [f, formData[f]]).filter(([, v]) => v !== "" && v !== undefined))
        : Object.fromEntries(Object.entries(formData).filter(([, v]) => v !== "" && v !== undefined))
      await updateProfile(payload)
      toast.success("Profile saved successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-5">
          <Skeleton className="w-24 h-24 rounded-3xl" />
          <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32" /></div>
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="p-12 text-center rounded-3xl">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-4">Unable to load profile. Make sure the backend is running.</p>
          <Link href="/doctors"><Button className="rounded-2xl bg-indigo-600 text-white">Find Doctors Anyway</Button></Link>
        </Card>
      </div>
    )
  }

  const isPatient = profile.role === "patient"
  const isProfileComplete = isPatient
    ? !!(profile.first_name && profile.phone_number && profile.date_of_birth)
    : !!(profile.first_name && profile.specialty && profile.bio)

  const inputClass = "rounded-2xl h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium focus-visible:ring-indigo-500"
  const textareaClass = "rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none font-medium focus-visible:ring-indigo-500"
  const labelClass = "text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block"

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-amber-800 dark:text-amber-300">Complete your profile</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Fill in your details so {isPatient ? "doctors can understand your needs" : "patients can find and trust you"}.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-2xl">
            <span className="text-3xl font-black">
              {formData.first_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
              {formData.last_name?.[0]?.toUpperCase() || ""}
            </span>
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform">
            <Camera className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {formData.first_name || "Your"} {formData.last_name || "Name"}
          </h1>
          <p className="text-slate-500 capitalize flex items-center gap-2 font-medium">
            {profile.role} Account
            {!isPatient && profile.is_verified && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />Verified
              </Badge>
            )}
            {isProfileComplete && (
              <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />Profile Complete
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 p-1.5 h-auto mb-6">
          <TabsTrigger value="profile" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md font-bold gap-2">
            <User className="w-4 h-4" />Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md font-bold gap-2">
            <ShieldCheck className="w-4 h-4" />Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md font-bold gap-2">
            <Settings className="w-4 h-4" />Settings
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Info */}
              <Card className="p-7 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <h3 className="text-lg font-black mb-5 text-slate-900 dark:text-white">Basic Information</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <Input value={formData.first_name} onChange={e => set("first_name", e.target.value)} placeholder="John" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <Input value={formData.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Doe" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <Input value={formData.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
                  </div>
                </div>
              </Card>

              {/* Role-specific Fields */}
              {isPatient ? (
                <Card className="p-7 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                  <h3 className="text-lg font-black mb-5 text-slate-900 dark:text-white">Medical Information</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <Input type="date" value={formData.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Gender</label>
                        <Select value={formData.gender} onValueChange={v => set("gender", v)}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Blood Group</label>
                        <Select value={formData.blood_group} onValueChange={v => set("blood_group", v)}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select blood group" /></SelectTrigger>
                          <SelectContent>
                            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
                              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={labelClass}>Insurance Provider</label>
                        <Input value={formData.insurance_provider} onChange={e => set("insurance_provider", e.target.value)} placeholder="e.g. Blue Cross" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Address</label>
                      <Input value={formData.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, City, State" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Emergency Contact</label>
                      <Input value={formData.emergency_contact} onChange={e => set("emergency_contact", e.target.value)} placeholder="Name & Phone Number" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Primary Injury / Condition</label>
                      <Input value={formData.primary_injury} onChange={e => set("primary_injury", e.target.value)} placeholder="e.g. Lower Back Pain, Knee Post-Op" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Medical History Notes</label>
                      <Textarea value={formData.medical_history} onChange={e => set("medical_history", e.target.value)} placeholder="Allergies, current medications, past surgeries..." className={`${textareaClass} min-h-[120px]`} />
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-7 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                  <h3 className="text-lg font-black mb-5 text-slate-900 dark:text-white">Professional Details</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Specialty</label>
                      <Input value={formData.specialty} onChange={e => set("specialty", e.target.value)} placeholder="e.g. Neurological Rehabilitation" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Professional Bio</label>
                      <Textarea value={formData.bio} onChange={e => set("bio", e.target.value)} placeholder="Tell patients about your expertise and approach..." className={`${textareaClass} min-h-[120px]`} />
                    </div>
                    <div>
                      <label className={labelClass}>Education & Credentials</label>
                      <Textarea value={formData.education_details} onChange={e => set("education_details", e.target.value)} placeholder="Medical school, residency, certifications..." className={`${textareaClass} min-h-[90px]`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Years of Experience</label>
                        <Input type="number" value={formData.years_of_experience} onChange={e => set("years_of_experience", parseInt(e.target.value))} placeholder="10" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Consultation Fee ($)</label>
                        <Input type="number" value={formData.consultation_fee} onChange={e => set("consultation_fee", parseFloat(e.target.value))} placeholder="150" className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Available Days</label>
                        <Input value={formData.available_days} onChange={e => set("available_days", e.target.value)} placeholder="Mon, Wed, Fri" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Available Hours</label>
                        <Input value={formData.available_hours} onChange={e => set("available_hours", e.target.value)} placeholder="9:00 AM – 5:00 PM" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Clinic Name</label>
                      <Input value={formData.clinic_name} onChange={e => set("clinic_name", e.target.value)} placeholder="e.g. CityRehab Center" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Clinic Address</label>
                      <Input value={formData.clinic_address} onChange={e => set("clinic_address", e.target.value)} placeholder="123 Medical Blvd, Suite 200" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Languages Spoken</label>
                      <Input value={formData.languages_spoken} onChange={e => set("languages_spoken", e.target.value)} placeholder="English, Spanish, Hindi" className={inputClass} />
                    </div>
                  </div>
                </Card>
              )}

              <Button onClick={() => handleSave()} disabled={saving} className="rounded-2xl font-bold px-10 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-5">
              <Card className="p-6 rounded-[2rem] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg">
                <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-indigo-500" />Account Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {profile.email}
                    </div>
                  </div>
                  {!isPatient && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">License #</label>
                      <div className="px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-700 dark:text-slate-300">
                        {profile.license_number || "Not provided"}
                      </div>
                    </div>
                  )}
                  {isPatient && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Membership</label>
                      <div className="px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Free Plan</span>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">Basic</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {!isPatient && (
                <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/60 dark:border-indigo-500/20 shadow-lg">
                  <h3 className="text-sm font-black mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />Verification Status
                  </h3>
                  {profile.is_verified ? (
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-3 py-1">
                      ✓ Verified Professional
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1">
                        ⏳ Pending Verification
                      </Badge>
                      <p className="text-xs text-slate-500 mt-2">Typically takes 1–2 business days.</p>
                    </>
                  )}
                </Card>
              )}

              <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 border border-emerald-200/60 dark:border-emerald-500/20 shadow-lg">
                <h3 className="text-sm font-black mb-3 text-slate-900 dark:text-white">Continue Your Journey</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {isPatient ? "Ready? Find the right specialist for your recovery." : "Patients are waiting. Make your profile shine."}
                </p>
                <Link href="/doctors">
                  <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-10">
                    {isPatient ? "Find Doctors →" : "View Listings →"}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card className="p-8 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg max-w-2xl">
            <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Security Settings</h3>
            <div className="space-y-5">
              {["Current Password","New Password","Confirm New Password"].map(label => (
                <div key={label}>
                  <label className={labelClass}>{label}</label>
                  <Input type="password" placeholder="••••••••" className={inputClass} />
                </div>
              ))}
              <Button className="rounded-2xl font-bold px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                Update Password
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card className="p-8 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg max-w-2xl">
            <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Preferences</h3>
            <div className="space-y-4">
              {[
                { label:"Email Notifications", desc:"Appointment updates and reminders" },
                { label:"SMS Reminders", desc:"Text messages before sessions" },
                { label:"Marketing Emails", desc:"News, tips and promotions" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <Button variant="outline" className="rounded-xl text-sm h-9">Enable</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
