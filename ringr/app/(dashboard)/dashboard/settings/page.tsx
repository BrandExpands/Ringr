'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Building2, Save, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) return

    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', authUser.id)
      .single()

    setUser(userData)
    setOrg(userData?.organization)
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ full_name: user.full_name })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile saved!')
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOrg = async () => {
    if (!org) return
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({
          name: org.name,
          phone: org.phone,
          timezone: org.timezone,
        })
        .eq('id', org.id)

      if (error) throw error
      alert('Organization saved!')
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#71717a]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#71717a]">Manage your account and organization</p>
      </div>

      {/* Profile */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#27272a]">
          <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Profile</h2>
            <p className="text-sm text-[#71717a]">Your personal information</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Full Name</label>
          <input
            type="text"
            value={user?.full_name || ''}
            onChange={(e) => setUser({ ...user, full_name: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-[#71717a] cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-[#71717a] mt-1.5">
            Contact support to change your email
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Role</label>
          <input
            type="text"
            value={user?.role || 'member'}
            className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-[#71717a] capitalize cursor-not-allowed"
            disabled
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>

      {/* Organization */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#27272a]">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Organization</h2>
            <p className="text-sm text-[#71717a]">Your business details</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Business Name</label>
          <input
            type="text"
            value={org?.name || ''}
            onChange={(e) => setOrg({ ...org, name: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
            placeholder="Smith HVAC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Phone Number</label>
          <input
            type="tel"
            value={org?.phone || ''}
            onChange={(e) => setOrg({ ...org, phone: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Timezone</label>
          <select
            value={org?.timezone || 'America/New_York'}
            onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors appearance-none cursor-pointer"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="America/Phoenix">Arizona Time</option>
          </select>
        </div>

        <button
          onClick={handleSaveOrg}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Organization
        </button>
      </div>
    </div>
  )
}
