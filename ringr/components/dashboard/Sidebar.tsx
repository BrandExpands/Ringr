'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Phone, LayoutDashboard, PhoneCall, Calendar, 
  BarChart3, Bot, Settings, CreditCard, LogOut,
  HelpCircle, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calls', href: '/dashboard/calls', icon: PhoneCall },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Agent', href: '/dashboard/agent', icon: Bot },
]

const secondaryNav = [
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#1f1f1f]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#10b981] rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Ringr</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-[#10b981]/10 text-[#10b981]'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Secondary Nav */}
      <div className="p-3 border-t border-[#1f1f1f] space-y-1">
        {secondaryNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-[#10b981]/10 text-[#10b981]'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#a1a1aa] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Help */}
      <div className="p-3 border-t border-[#1f1f1f]">
        <a 
          href="mailto:support@ringr.ai"
          className="flex items-center gap-3 px-3 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-sm text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <div>
            <p className="font-medium text-white">Need help?</p>
            <p className="text-xs">Contact support</p>
          </div>
        </a>
      </div>
    </aside>
  )
}
