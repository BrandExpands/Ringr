'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  CreditCard, Check, Zap, Clock, ChevronRight, 
  Loader2, ExternalLink, AlertCircle 
} from 'lucide-react'

const PLANS = [
  {
    id: 'phone',
    name: 'Phone',
    price: 19,
    desc: 'VoIP softphone',
    features: ['1 phone number', 'Unlimited US/CA calling', 'Call recording', 'Voicemail', 'Web softphone'],
  },
  {
    id: 'power',
    name: 'Power',
    price: 29,
    desc: 'For reps who grind',
    features: ['Everything in Phone', 'Power dialer', '1-click voicemail drops', 'Local presence', 'Call dispositions'],
  },
  {
    id: 'ai-starter',
    name: 'AI Starter',
    price: 99,
    minutes: 100,
    features: ['Everything in Power', '100 AI minutes/mo', '1 AI agent', 'Inbound or outbound', '$0.55/min overage'],
  },
  {
    id: 'ai-pro',
    name: 'AI Pro',
    price: 199,
    minutes: 300,
    features: ['Everything in Starter', '300 AI minutes/mo', '2 AI agents', 'Calendar sync', '$0.55/min overage'],
  },
  {
    id: 'ai-growth',
    name: 'AI Growth',
    price: 349,
    minutes: 750,
    popular: true,
    features: ['Everything in Pro', '750 AI minutes/mo', '3 AI agents', '2 phone numbers', '$0.50/min overage'],
  },
  {
    id: 'ai-business',
    name: 'AI Business',
    price: 599,
    minutes: 1500,
    features: ['Everything in Growth', '1,500 AI minutes/mo', 'Unlimited AI agents', '5 phone numbers', '$0.45/min overage'],
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [org, setOrg] = useState<any>(null)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  
  const router = useRouter()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select(`
        organization:organizations(
          *,
          plan:plans(*)
        )
      `)
      .eq('id', user.id)
      .single()

    const organization = Array.isArray(userData?.organization) 
      ? userData?.organization[0] 
      : userData?.organization

    if (organization) {
      setOrg(organization)
      
      const { data: status } = await supabase
        .rpc('get_account_status', { org_id: organization.id })
      setAccountStatus(status)
    }

    setLoading(false)
  }

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const { url, error } = await response.json()
      
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch (err: any) {
      alert(err.message || 'Failed to start checkout')
    } finally {
      setSubscribing(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
      })

      const { url, error } = await response.json()
      
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch (err: any) {
      alert(err.message || 'Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#71717a]" />
      </div>
    )
  }

  const currentPlanId = org?.plan?.name
  const isTrialing = accountStatus?.is_trial
  const isLocked = accountStatus?.is_locked

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-[#71717a]">Manage your subscription and billing</p>
      </div>

      {/* Trial/Status Banner */}
      {isTrialing && accountStatus?.trial_days_remaining > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
          <Clock className="w-5 h-5" />
          <div>
            <p className="font-semibold">
              {accountStatus.trial_days_remaining} days left in your free trial
            </p>
            <p className="text-sm opacity-80">
              Subscribe before your trial ends to keep using Ringr
            </p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">
              {accountStatus.lock_reason === 'trial_expired' && 'Your trial has ended'}
              {accountStatus.lock_reason === 'minutes_exhausted' && 'You\'ve used all your minutes'}
              {accountStatus.lock_reason === 'subscription_canceled' && 'Your subscription is canceled'}
            </p>
            <p className="text-sm opacity-80">
              Subscribe or upgrade to continue using Ringr
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      {org?.stripe_subscription_id && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#71717a]">Current Plan</p>
              <p className="text-xl font-bold text-white capitalize">{currentPlanId}</p>
              {accountStatus?.minutes_included > 0 && (
                <p className="text-sm text-[#71717a]">
                  {accountStatus?.minutes_used?.toLocaleString()} / {accountStatus?.minutes_included?.toLocaleString()} AI minutes used
                </p>
              )}
            </div>
            <button
              onClick={handleManageBilling}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-white font-semibold rounded-xl transition-colors"
            >
              Manage Billing
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          
          {/* Usage Bar */}
          {accountStatus?.minutes_included > 0 && (
            <div className="mt-4">
              <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    (accountStatus?.minutes_used / accountStatus?.minutes_included) >= 0.9 ? 'bg-red-500' :
                    (accountStatus?.minutes_used / accountStatus?.minutes_included) >= 0.75 ? 'bg-yellow-500' : 'bg-[#10b981]'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (accountStatus?.minutes_used / accountStatus?.minutes_included) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {org?.stripe_subscription_id ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id
            
            return (
              <div 
                key={plan.id}
                className={`bg-[#18181b] border rounded-2xl p-5 relative ${
                  plan.popular ? 'border-[#10b981]' : 'border-[#27272a]'
                } ${isCurrent ? 'bg-[#10b981]/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#10b981] text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.desc && <p className="text-sm text-[#71717a]">{plan.desc}</p>}
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-[#71717a]">/mo</span>
                  </div>
                  {plan.minutes && (
                    <p className="text-sm text-[#71717a] mt-1">
                      {plan.minutes.toLocaleString()} AI minutes/mo
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                      <Check className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className="w-full px-4 py-2.5 bg-[#27272a] text-[#71717a] font-semibold rounded-xl cursor-not-allowed" disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing === plan.id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-colors ${
                      plan.popular 
                        ? 'bg-[#10b981] hover:bg-[#059669] text-white' 
                        : 'bg-[#27272a] hover:bg-[#3f3f46] text-white'
                    }`}
                  >
                    {subscribing === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Select Plan
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Billing FAQ</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-white">What happens if I run out of AI minutes?</p>
            <p className="text-[#71717a]">
              You'll be charged the overage rate for your plan. VoIP and power dialer are always unlimited.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Can I change plans anytime?</p>
            <p className="text-[#71717a]">
              Yes, you can upgrade or downgrade at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">How do I cancel?</p>
            <p className="text-[#71717a]">
              You can cancel anytime from the billing portal. You'll keep access until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
