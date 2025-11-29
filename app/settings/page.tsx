"use client"

import { useState } from "react"
import { mockUser, formatCurrency } from "@/lib/mock-data"
import { useToast } from "@/components/toast"
import { User, Lock, Palette } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function Settings() {
  const [email, setEmail] = useState(mockUser.email)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currency, setCurrency] = useState<"USD" | "DZD">(mockUser.currency)
  const { addToast } = useToast()
  const { theme, toggleTheme } = useTheme()

  const handleUpdateEmail = () => {
    if (!email) {
      addToast("Email cannot be empty", "error")
      return
    }
    if (!email.includes("@")) {
      addToast("Please enter a valid email", "error")
      return
    }
    addToast("Email updated successfully", "success")
    setEmail(email)
  }

  const handleUpdatePassword = () => {
    if (!password || !confirmPassword) {
      addToast("Please fill in all password fields", "error")
      return
    }
    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "error")
      return
    }
    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }
    addToast("Password updated successfully", "success")
    setPassword("")
    setConfirmPassword("")
  }

  const handleCurrencyChange = (newCurrency: "USD" | "DZD") => {
    setCurrency(newCurrency)
    addToast(`Currency changed to ${newCurrency}`, "success")
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
              value={mockUser.name}
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
                className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap"
              >
                Update
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
            <label className="text-xs sm:text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm"
          >
            Update Password
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
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
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
