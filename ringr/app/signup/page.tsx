'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, Lock, User, ArrowRight, Loader2, Check } from 'lucide-react'

const plans: Record<string, { name: string; price: string; desc: string }> = {
  'phone': { name: 'Phone', price: '$19/mo', desc: 'VoIP softphone' },
  'power': { name: 'Power', price: '$29/mo', desc: 'Power dialer included' },
  'ai-starter': { name: 'AI Starter', price: '$99/mo', desc: '100 AI minutes' },
  'ai-pro': { name: 'AI Pro', price: '$199/mo', desc: '300 AI minutes' },
  'ai-growth': { name: 'AI Growth', price: '$349/mo', desc: '750 AI minutes' },
  'ai-business': { name: 'AI Business', price: '$599/mo', desc: '1,500 AI minutes' },
}

function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') || 'ai-starter'
  const plan = plans[planKey] || plans['ai-starter']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      router.push(`/onboarding?plan=${planKey}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'VoIP & Power Dialer included',
    'AI agents for inbound & outbound',
    'Call recording & transcripts',
    '7-day free trial, no card required',
  ]

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Ringr</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Start your free trial</h1>
          <p className="text-[#a1a1aa] mb-8">7 days free, no credit card required</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-[#71717a] mt-1.5">At least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-[#71717a] text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-[#a1a1aa] hover:text-white transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#a1a1aa] hover:text-white transition-colors">Privacy Policy</Link>
          </p>

          <p className="text-center text-[#71717a] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#10b981] font-semibold hover:text-[#34d399] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 bg-[#18181b] border-l border-[#27272a] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-transparent" />
        <div className="max-w-md relative z-10">
          <div className="w-20 h-20 bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl flex items-center justify-center mb-8">
            <Phone className="w-10 h-10 text-[#10b981]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Stop losing jobs to missed calls
          </h2>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[#a1a1aa]">
                <div className="w-6 h-6 bg-[#10b981]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#10b981]" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          {/* Selected Plan */}
          <div className="mt-10 p-6 bg-[#27272a]/50 rounded-2xl border border-[#3f3f46]">
            <p className="text-[#71717a] text-sm mb-1">Selected plan</p>
            <p className="text-white text-xl font-bold">{plan.name}</p>
            <p className="text-[#a1a1aa] text-sm">
              {plan.price} • {plan.desc}
            </p>
            <Link 
              href="/#pricing" 
              className="text-[#10b981] text-sm font-medium mt-3 inline-block hover:text-[#34d399] transition-colors"
            >
              Change plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
