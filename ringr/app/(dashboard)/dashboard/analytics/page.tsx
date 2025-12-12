import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, TrendingDown, Minus, PhoneCall, Calendar, Clock } from 'lucide-react'
import { formatDuration, formatMinutes } from '@/lib/utils'

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData?.organization_id) redirect('/onboarding')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: analytics } = await supabase
    .from('call_analytics')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const totals = analytics?.reduce((acc, day) => ({
    calls: acc.calls + day.total_calls,
    answered: acc.answered + day.answered_calls,
    appointments: acc.appointments + day.appointments_booked,
    duration: acc.duration + day.total_duration_seconds,
  }), { calls: 0, answered: 0, appointments: 0, duration: 0 }) || { calls: 0, answered: 0, appointments: 0, duration: 0 }

  const thisWeek = analytics?.slice(0, 7) || []
  const lastWeek = analytics?.slice(7, 14) || []

  const thisWeekCalls = thisWeek.reduce((sum, d) => sum + d.total_calls, 0)
  const lastWeekCalls = lastWeek.reduce((sum, d) => sum + d.total_calls, 0)
  const callsChange = lastWeekCalls > 0 
    ? Math.round(((thisWeekCalls - lastWeekCalls) / lastWeekCalls) * 100) 
    : 0

  const thisWeekApts = thisWeek.reduce((sum, d) => sum + d.appointments_booked, 0)
  const lastWeekApts = lastWeek.reduce((sum, d) => sum + d.appointments_booked, 0)
  const aptsChange = lastWeekApts > 0 
    ? Math.round(((thisWeekApts - lastWeekApts) / lastWeekApts) * 100) 
    : 0

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-[#10b981]" />
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-[#71717a]" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[#71717a]">Performance metrics for the last 30 days</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendIcon value={callsChange} />
              <span className={callsChange >= 0 ? 'text-[#10b981]' : 'text-red-400'}>
                {callsChange > 0 ? '+' : ''}{callsChange}%
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totals.calls.toLocaleString()}</p>
          <p className="text-sm text-[#71717a] mt-1">Total Calls</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendIcon value={aptsChange} />
              <span className={aptsChange >= 0 ? 'text-[#10b981]' : 'text-red-400'}>
                {aptsChange > 0 ? '+' : ''}{aptsChange}%
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totals.appointments.toLocaleString()}</p>
          <p className="text-sm text-[#71717a] mt-1">Appointments Booked</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(Math.round(totals.duration / 60))}</p>
          <p className="text-sm text-[#71717a] mt-1">Total Talk Time</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {totals.calls > 0 
              ? Math.round((totals.answered / totals.calls) * 100) 
              : 100}%
          </p>
          <p className="text-sm text-[#71717a] mt-1">Answer Rate</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272a]">
          <h2 className="text-lg font-semibold text-white">Daily Breakdown</h2>
        </div>
        
        {analytics && analytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Calls</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Answered</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Appointments</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Avg Duration</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Total Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {analytics.map((day) => (
                  <tr key={day.id} className="hover:bg-[#27272a]/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-medium text-white">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#a1a1aa]">{day.total_calls}</td>
                    <td className="px-5 py-4">
                      <span className="text-[#10b981]">{day.answered_calls}</span>
                      {day.missed_calls > 0 && (
                        <span className="text-red-400 ml-1">
                          / {day.missed_calls} missed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {day.appointments_booked > 0 ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#10b981]/10 text-[#10b981]">{day.appointments_booked}</span>
                      ) : (
                        <span className="text-[#71717a]">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[#a1a1aa]">
                        {formatDuration(day.avg_duration_seconds)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#71717a]">
                        {formatMinutes(Math.round(day.total_duration_seconds / 60))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-5">
            <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-[#71717a]" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">No data yet</p>
            <p className="text-sm text-[#71717a] max-w-xs mx-auto">
              Analytics will appear here once you start receiving calls
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
