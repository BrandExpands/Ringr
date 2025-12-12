import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  PhoneCall, Calendar, Clock, TrendingUp, 
  ArrowRight, Phone, CheckCircle2, Zap, PhoneOutgoing, PhoneIncoming
} from 'lucide-react'
import { formatDuration, formatRelativeTime, formatPhoneNumber, getOutcomeLabel, getOutcomeColor } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData?.organization_id) redirect('/onboarding')

  const orgId = userData.organization_id

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayCalls } = await supabase
    .from('calls')
    .select('*')
    .eq('organization_id', orgId)
    .gte('created_at', today.toISOString())

  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('organization_id', orgId)
    .gte('created_at', today.toISOString())

  // Get recent calls
  const { data: recentCalls } = await supabase
    .from('calls')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('organization_id', orgId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  // Calculate stats
  const totalCalls = todayCalls?.length || 0
  const totalAppointments = todayAppointments?.length || 0
  const avgDuration = todayCalls?.length 
    ? Math.round(todayCalls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / todayCalls.length)
    : 0
  const answerRate = totalCalls > 0 
    ? Math.round((todayCalls?.filter(c => c.status === 'completed').length || 0) / totalCalls * 100)
    : 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#71717a]">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-[#71717a] uppercase">Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCalls}</p>
          <p className="text-sm text-[#71717a] mt-1">Total Calls</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#10b981]" />
            </div>
            <span className="text-xs font-medium text-[#71717a] uppercase">Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalAppointments}</p>
          <p className="text-sm text-[#71717a] mt-1">Appointments Booked</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-[#71717a] uppercase">Average</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatDuration(avgDuration)}</p>
          <p className="text-sm text-[#71717a] mt-1">Call Duration</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-[#71717a] uppercase">Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{answerRate}%</p>
          <p className="text-sm text-[#71717a] mt-1">Answer Rate</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold text-white">Recent Calls</h2>
            <Link href="/dashboard/calls" className="text-sm text-[#10b981] font-medium hover:text-[#34d399] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentCalls && recentCalls.length > 0 ? (
            <div className="divide-y divide-[#27272a]">
              {recentCalls.map((call) => (
                <Link 
                  key={call.id} 
                  href={`/dashboard/calls/${call.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#27272a]/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#71717a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {call.caller_name || formatPhoneNumber(call.caller_phone)}
                    </p>
                    <p className="text-sm text-[#71717a]">
                      {formatDuration(call.duration_seconds)} • {formatRelativeTime(call.created_at)}
                    </p>
                  </div>
                  {call.outcome && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      call.outcome === 'appointment_booked' ? 'bg-[#10b981]/10 text-[#10b981]' :
                      call.outcome === 'callback_requested' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-[#27272a] text-[#a1a1aa]'
                    }`}>
                      {getOutcomeLabel(call.outcome)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-5">
              <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-[#71717a]" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">No calls yet</p>
              <p className="text-sm text-[#71717a] max-w-xs mx-auto">
                When your AI agent starts taking calls, they'll appear here
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-[#10b981] font-medium hover:text-[#34d399] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="divide-y divide-[#27272a]">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{apt.customer_name}</p>
                    <p className="text-sm text-[#71717a]">
                      {apt.service_type || 'Service call'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {new Date(apt.scheduled_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-[#71717a]">
                      {new Date(apt.scheduled_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-5">
              <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-[#71717a]" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">No upcoming appointments</p>
              <p className="text-sm text-[#71717a] max-w-xs mx-auto">
                Appointments booked by your AI agent will show up here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
