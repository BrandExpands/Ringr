'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bot, Phone, MessageSquare, Settings, Save, Loader2, Plus, X } from 'lucide-react'

export default function AgentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [newService, setNewService] = useState('')

  useEffect(() => {
    loadAgent()
  }, [])

  const loadAgent = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) return

    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single()

    setAgent(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!agent) return
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('agents')
        .update({
          name: agent.name,
          greeting_message: agent.greeting_message,
          system_prompt: agent.system_prompt,
          services: agent.services,
          is_active: agent.is_active,
        })
        .eq('id', agent.id)

      if (error) throw error
      alert('Settings saved!')
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    if (newService && !agent.services.includes(newService)) {
      setAgent({ ...agent, services: [...agent.services, newService] })
      setNewService('')
    }
  }

  const removeService = (service: string) => {
    setAgent({ 
      ...agent, 
      services: agent.services.filter((s: string) => s !== service) 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#71717a]" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-6 h-6 text-[#71717a]" />
        </div>
        <p className="text-lg font-semibold text-white mb-2">No agent configured</p>
        <p className="text-sm text-[#71717a]">Please complete onboarding to set up your AI agent</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent</h1>
          <p className="text-[#71717a]">Configure how your AI handles calls</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Basic Settings */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#27272a]">
          <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Basic Settings</h2>
            <p className="text-sm text-[#71717a]">General agent configuration</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Agent Name</label>
          <input
            type="text"
            value={agent.name}
            onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
            placeholder="Main Agent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Phone Number</label>
          <input
            type="text"
            value={agent.phone_number || 'Not assigned'}
            className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-[#71717a] cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-[#71717a] mt-1.5">Contact support to change your phone number</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Agent Active</p>
            <p className="text-sm text-[#71717a]">Turn off to stop taking calls</p>
          </div>
          <button
            onClick={() => setAgent({ ...agent, is_active: !agent.is_active })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              agent.is_active ? 'bg-[#10b981]' : 'bg-[#3f3f46]'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              agent.is_active ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Conversation Settings */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#27272a]">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Conversation</h2>
            <p className="text-sm text-[#71717a]">How your agent talks to callers</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Greeting Message</label>
          <textarea
            value={agent.greeting_message}
            onChange={(e) => setAgent({ ...agent, greeting_message: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors min-h-[100px] resize-none"
            placeholder="Thanks for calling! How can I help you today?"
          />
          <p className="text-xs text-[#71717a] mt-1.5">This is the first thing callers will hear</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">System Prompt (Advanced)</label>
          <textarea
            value={agent.system_prompt || ''}
            onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value })}
            className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors min-h-[120px] resize-none font-mono text-sm"
            placeholder="Optional: Add custom instructions for your AI agent..."
          />
          <p className="text-xs text-[#71717a] mt-1.5">Advanced: Custom instructions that guide the AI's behavior</p>
        </div>
      </div>

      {/* Services */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#27272a]">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Services</h2>
            <p className="text-sm text-[#71717a]">Services your agent can discuss</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Your Services</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.services?.map((service: string) => (
              <span
                key={service}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] rounded-full text-sm font-medium"
              >
                {service}
                <button
                  onClick={() => removeService(service)}
                  className="hover:text-[#34d399]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {(!agent.services || agent.services.length === 0) && (
              <p className="text-[#71717a] text-sm">No services added</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              className="flex-1 px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
              placeholder="Add a service..."
            />
            <button onClick={addService} className="flex items-center gap-2 px-4 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
