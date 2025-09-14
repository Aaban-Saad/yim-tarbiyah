"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { auth } from "./firebase"
import { getUserProfile, createUserProfile } from "./firestore"
import type { UserProfile } from "./types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = userProfile?.isAdmin || false

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[v0] Auth state changed:", user?.email) // Added debug logging
      setUser(user)

      if (user) {
        let profile = await getUserProfile(user.uid)
        console.log("[v0] Existing profile found:", !!profile) // Added debug logging

        if (!profile && user.email && user.displayName) {
          console.log("[v0] Creating new user profile for:", user.email) // Added debug logging
          await createUserProfile(user.uid, user.email, user.displayName)
          profile = await getUserProfile(user.uid)
          console.log("[v0] Profile created successfully:", !!profile) // Added debug logging
        }

        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
