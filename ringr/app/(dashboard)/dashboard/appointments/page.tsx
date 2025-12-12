import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react'
import { formatPhoneNumber, getStatusColor } from '@/lib/utils'

export default async function AppointmentsPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData?.organization_id) redirect('/onboarding')

  const now = new Date().toISOString()

  const { data: upcoming } = await supabase
    .from('appointments')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  const { data: past } = await supabase
    .from('appointments')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-[#71717a]">Appointments booked by your AI agent</p>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((apt) => (
              <div key={apt.id} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{apt.customer_name}</p>
                      <p className="text-sm text-[#71717a]">
                        {formatPhoneNumber(apt.customer_phone)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    apt.status === 'confirmed' ? 'bg-[#10b981]/10 text-[#10b981]' :
                    apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-[#27272a] text-[#a1a1aa]'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <Calendar className="w-4 h-4" />
                    {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <Clock className="w-4 h-4" />
                    {new Date(apt.scheduled_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {apt.duration_minutes && (
                      <span className="text-[#71717a]">
                        ({apt.duration_minutes} min)
                      </span>
                    )}
                  </div>
                  {apt.service_type && (
                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                      <span className="w-4 h-4 flex items-center justify-center">🔧</span>
                      {apt.service_type}
                    </div>
                  )}
                  {apt.customer_address && (
                    <div className="flex items-start gap-2 text-[#a1a1aa]">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span className="line-clamp-2">{apt.customer_address}</span>
                    </div>
                  )}
                </div>

                {apt.notes && (
                  <p className="mt-4 pt-4 border-t border-[#27272a] text-sm text-[#71717a]">
                    {apt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl">
            <div className="text-center py-12 px-5">
              <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-[#71717a]" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">No upcoming appointments</p>
              <p className="text-sm text-[#71717a] max-w-xs mx-auto">
                Appointments booked by your AI agent will show up here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {past && past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Past</h2>
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Service</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Date</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {past.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#27272a]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">{apt.customer_name}</p>
                          <p className="text-sm text-[#71717a]">
                            {formatPhoneNumber(apt.customer_phone)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#a1a1aa]">{apt.service_type || '—'}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#71717a]">
                          {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          apt.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' :
                          apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          'bg-[#27272a] text-[#a1a1aa]'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
