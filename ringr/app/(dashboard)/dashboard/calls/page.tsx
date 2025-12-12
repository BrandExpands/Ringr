import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Phone, Play, FileText, ChevronRight } from 'lucide-react'
import { formatDuration, formatRelativeTime, formatPhoneNumber, getOutcomeLabel, getOutcomeColor, getSentimentIcon } from '@/lib/utils'

export default async function CallsPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData?.organization_id) redirect('/onboarding')

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('organization_id', userData.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calls</h1>
          <p className="text-[#71717a]">View and manage all your calls</p>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
        {calls && calls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Caller</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Duration</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Outcome</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Sentiment</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">Time</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-[#27272a]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#27272a] rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-[#71717a]" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {call.caller_name || formatPhoneNumber(call.caller_phone)}
                          </p>
                          {call.caller_name && (
                            <p className="text-sm text-[#71717a]">
                              {formatPhoneNumber(call.caller_phone)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[#a1a1aa]">
                        {formatDuration(call.duration_seconds)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {call.outcome ? (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          call.outcome === 'appointment_booked' ? 'bg-[#10b981]/10 text-[#10b981]' :
                          call.outcome === 'callback_requested' ? 'bg-blue-500/10 text-blue-400' :
                          call.outcome === 'information_provided' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-[#27272a] text-[#a1a1aa]'
                        }`}>
                          {getOutcomeLabel(call.outcome)}
                        </span>
                      ) : (
                        <span className="text-[#71717a]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {call.sentiment ? (
                        <span className="text-lg" title={call.sentiment}>
                          {getSentimentIcon(call.sentiment)}
                        </span>
                      ) : (
                        <span className="text-[#71717a]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#71717a]">
                        {formatRelativeTime(call.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {call.recording_url && (
                          <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                            title="Play recording"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/dashboard/calls/${call.id}`}
                          className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                          title="View details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-5">
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
    </div>
  )
}
