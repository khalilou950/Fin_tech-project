"use client"

import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from 'next/navigation'
import { Moon, Sun, Search, LogOut, Menu } from 'lucide-react'

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/signin")
  }

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10 gap-2 shadow-sm">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <div className="relative hidden sm:flex flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-1.5 sm:p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
