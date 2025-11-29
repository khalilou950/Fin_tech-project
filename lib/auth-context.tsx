"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "./api"

export interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken")
      if (token) {
        try {
          const response = await api.getMe()
          if (response.success) {
            setUser({
              id: response.data.user._id || response.data.user.id,
              name: response.data.user.fullName,
              email: response.data.user.email,
            })
          } else {
            // Token invalid, clear it
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
          }
        } catch (error) {
          console.error("Auth check failed:", error)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signUp = async (name: string, email: string, password: string, confirmPassword: string) => {
    const response = await api.signup(name, email, password, confirmPassword)
    
    if (response.success) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      setUser({
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.fullName,
        email: response.data.user.email,
      })
    } else {
      throw new Error(response.message || "Sign up failed")
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await api.signin(email, password)
    
    if (response.success) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      setUser({
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.fullName,
        email: response.data.user.email,
      })
    } else {
      throw new Error(response.message || "Invalid email or password")
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      await api.logout(refreshToken || undefined)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
