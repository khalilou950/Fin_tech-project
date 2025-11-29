"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Home, Wallet, TrendingUp, BarChart3, Settings, X } from 'lucide-react'
import Image from 'next/image'

const menuItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/transactions", icon: Wallet, label: "Transactions" },
  { href: "/budgets", icon: TrendingUp, label: "Budgets" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shadow-lg">
      <div className="p-4 sm:p-6 border-b border-sidebar-border/50 flex items-center justify-between bg-gradient-to-r from-sidebar to-sidebar/95">
        <div className="flex items-center gap-3">
          <Image 
            src="/sarfydz-logo.png" 
            alt="SarfyDZ Logo" 
            width={36} 
            height={36}
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sidebar-primary to-cyan-400 bg-clip-text text-transparent">SarfyDZ</h1>
            <p className="text-xs sm:text-sm text-sidebar-foreground/70">AI Financial Manager</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                isActive
                  ? "bg-gradient-to-r from-sidebar-primary to-cyan-400/80 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
