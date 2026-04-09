"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/mock-data"
import { useToast } from "@/components/toast"
import { User, Lock, Palette } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { api } from "@/lib/api"

export default function Settings() {
  const [user, setUser] = useState<{ name: string; email: string; currency: "USD" | "DZD" } | null>(null)
  const [email, setEmail] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currency, setCurrency] = useState<"USD" | "DZD">("DZD")
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<{ email?: boolean; password?: boolean; currency?: boolean }>({})
  
  const { addToast } = useToast()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.getMe()
        if (response.success && response.data?.user) {
          const userData = response.data.user
          setUser({
            name: userData.fullName || "",
            email: userData.email || "",
            currency: userData.currency || "DZD",
          })
          setEmail(userData.email || "")
          setCurrency(userData.currency || "DZD")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        addToast("Error fetching profile", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdateEmail = async () => {
    if (!email) {
      addToast("Email cannot be empty", "error")
      return
    }
    if (!email.includes("@")) {
      addToast("Please enter a valid email", "error")
      return
    }
    if (email === user?.email) {
      addToast("Email is already the same", "error")
      return
    }
    
    setUpdating(prev => ({ ...prev, email: true }))
    try {
      const res = await api.updateEmail(email)
      if (res.success) {
        addToast("Email updated successfully", "success")
        setUser(prev => prev ? { ...prev, email } : null)
      } else {
        addToast(res.message || "Failed to update email", "error")
      }
    } catch (error) {
      addToast("An error occurred", "error")
    } finally {
      setUpdating(prev => ({ ...prev, email: false }))
    }
  }

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast("Veuillez remplir tous les champs du mot de passe", "error")
      return
    }
    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error")
      return
    }
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }

    setUpdating(prev => ({ ...prev, password: true }))
    try {
      const res = await api.updatePassword(oldPassword, newPassword)
      if (res.success) {
        addToast("Mot de passe mis à jour", "success")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        addToast(res.message || "Erreur de mot de passe", "error")
      }
    } catch (error) {
      addToast("An error occurred", "error")
    } finally {
      setUpdating(prev => ({ ...prev, password: false }))
    }
  }

  const handleCurrencyChange = async (newCurrency: "USD" | "DZD") => {
    if (currency === newCurrency) return

    setUpdating(prev => ({ ...prev, currency: true }))
    try {
      const res = await api.updateSettings({ currency: newCurrency })
      if (res.success) {
        setCurrency(newCurrency)
        setUser(prev => prev ? { ...prev, currency: newCurrency } : null)
        addToast(`Currency changed to ${newCurrency}`, "success")
      } else {
        addToast("Failed to change currency", "error")
      }
    } catch (error) {
      addToast("An error occurred", "error")
    } finally {
      setUpdating(prev => ({ ...prev, currency: false }))
    }
  }

  if (loading) {
     return (
       <div className="p-3 sm:p-6 flex items-center justify-center min-h-[50vh]">
         <p className="text-muted-foreground">Chargement des paramètres...</p>
       </div>
     )
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Profile</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Update your account information</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              className="w-full mt-1.5 px-3 py-2 text-sm bg-muted border border-input rounded-lg text-foreground/50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleUpdateEmail}
                disabled={updating.email}
                className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap disabled:opacity-50"
              >
                {updating.email ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Security</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your password</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">Ancien Mot de Passe</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter old password"
              className="w-full mt-1.5 px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full mt-1.5 px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full mt-1.5 px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={updating.password}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm disabled:opacity-50"
          >
            {updating.password ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Palette className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Preferences</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-foreground text-sm sm:text-base">Dark Mode</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Current: {theme === "dark" ? "Enabled" : "Disabled"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                theme === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {theme === "dark" ? "On" : "Off"}
            </button>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground">Currency</label>
            <div className="flex gap-2 mt-2">
              {(["USD", "DZD"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  disabled={updating.currency}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm disabled:opacity-50 ${
                    currency === curr
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Example: {formatCurrency(50000, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
