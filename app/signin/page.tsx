"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { useToast } from "@/components/toast"
import Image from 'next/image'

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn(email, password)
      addToast("Logged in successfully", "success")
      router.push("/")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      setError(message)
      addToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2.5 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === "light" ? (
          <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM5 8a1 1 0 100-2H4a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left side - Form */}
          <div className="w-full">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Sign in to your SarfyDZ account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm hover:shadow-md"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 transition-all duration-200 mt-6"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-muted-foreground text-sm text-center">
                  Don't have an account?{" "}
                  <Link href="/signup" className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Logo and description */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-card to-card border border-border rounded-full p-8 sm:p-12 shadow-lg">
                <Image 
                  src="/sarfydz-logo.png" 
                  alt="SarfyDZ Logo" 
                  width={120} 
                  height={120}
                  className="w-24 h-24 sm:w-32 sm:h-32"
                />
              </div>
            </div>
            <div className="max-w-sm">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-3">SarfyDZ</h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Smart financial management for your daily spending. Take control of your money and achieve your financial goals with ease.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
