"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

export interface ProfileData {
  id: string
  email: string
  role: 'patient' | 'doctor'
  first_name?: string
  last_name?: string
  // Shared
  phone_number?: string
  // Patient-specific
  emergency_contact?: string
  emergency_contact_phone?: string
  date_of_birth?: string
  address?: string
  primary_injury?: string
  medical_history?: string
  gender?: string
  blood_group?: string
  insurance_provider?: string
  insurance_id?: string
  age?: number
  weight?: string
  height?: string
  allergies?: string
  current_medications?: string
  past_surgeries?: string
  chronic_conditions?: string
  // Doctor-specific
  bio?: string
  specialty?: string
  education_details?: string
  years_of_experience?: number
  consultation_fee?: number
  available_days?: string
  available_hours?: string
  license_number?: string
  is_verified?: boolean
  clinic_name?: string
  clinic_address?: string
  languages_spoken?: string
  registration_number?: string
  qualification_proof_url?: string
  specialization_certificates?: string
  profile_completed?: boolean
  // Meta
  created_at?: string
}

interface UserContextType {
  user: User | null
  session: Session | null
  profile: ProfileData | null
  loading: boolean
  profileLoading: boolean
  updateProfile: (data: Partial<ProfileData>) => Promise<void>
  refetchProfile: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileLoading: true,
  updateProfile: async () => {},
  refetchProfile: async () => {},
  logout: async () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchProfile = useCallback(async (accessToken: string) => {
    setProfileLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = { Authorization: `Bearer ${accessToken}` }

      // Try unified /me endpoint first
      const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, { headers })
      if (meRes.ok) {
        const data = await meRes.json()
        setProfile(data)
        return
      }

      // Fallback: try patient, then doctor
      const patientRes = await fetch(`${apiUrl}/api/v1/patients/me`, { headers })
      if (patientRes.ok) {
        const data = await patientRes.json()
        setProfile({ ...data, role: 'patient' as const })
        return
      }

      const doctorRes = await fetch(`${apiUrl}/api/v1/doctors/me`, { headers })
      if (doctorRes.ok) {
        const data = await doctorRes.json()
        setProfile({ ...data, role: 'doctor' as const })
        return
      }
    } catch (err) {
      console.warn('[UserContext] Failed to fetch profile (is backend running?):', err)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial session load
    const initSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.access_token) {
        await fetchProfile(initialSession.access_token)
      }
      setLoading(false)
    }

    initSession()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_IN' && newSession?.access_token) {
          await fetchProfile(newSession.access_token)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && newSession?.access_token) {
          // Re-use existing profile; token is valid
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!session?.access_token || !profile) {
      throw new Error('Not authenticated or profile not loaded')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }

    const endpoint = profile.role === 'patient'
      ? `${apiUrl}/api/v1/patients/me`
      : `${apiUrl}/api/v1/doctors/me`

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to update profile')
    }

    // Optimistically merge the update and refetch
    setProfile(prev => prev ? { ...prev, ...data } : prev)
    await fetchProfile(session.access_token)
  }, [session, profile, fetchProfile])

  const refetchProfile = useCallback(async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token)
    }
  }, [session, fetchProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    router.push('/')
  }, [router])

  return (
    <UserContext.Provider value={{
      user,
      session,
      profile,
      loading,
      profileLoading,
      updateProfile,
      refetchProfile,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
