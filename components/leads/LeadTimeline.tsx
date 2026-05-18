import { fmtDateTime } from '@/lib/utils'
import type { Lead } from '@/lib/types'

type TimelineEvent = {
  label: string
  date: string
  color: string
}

export default function LeadTimeline({ lead }: { lead: Lead }) {
  const events: TimelineEvent[] = []

  events.push({ label: 'Lead submitted', date: lead.created_at, color: '#8B2FC9' })

  if (lead.contacted_at) {
    events.push({ label: 'Contacted', date: lead.contacted_at, color: '#1D4ED8' })
  }

  if (lead.status === 'converted') {
    events.push({ label: 'Converted', date: lead.last_activity_at, color: '#16A34A' })
  }

  if (lead.status === 'not_a_fit') {
    events.push({ label: 'Marked not a fit', date: lead.last_activity_at, color: '#6B7280' })
  }

  events.push({ label: 'Last activity', date: lead.last_activity_at, color: '#6B7280' })

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p
        className="font-body uppercase pb-3 mb-5"
        style={{
          color: '#6B7280',
          fontSize: '11px',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #F5F5F5',
        }}
      >
        Timeline
      </p>

      <div>
        {events.map((event, i) => {
          const isLast = i === events.length - 1
          return (
            <div key={i} className="flex gap-3 items-start">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center flex-shrink-0 w-5">
                <div
                  className="rounded-full mt-1.5"
                  style={{ width: '8px', height: '8px', background: event.color, flexShrink: 0 }}
                />
                {!isLast && (
                  <div
                    className="flex-1 mt-1"
                    style={{ width: '1px', minHeight: '16px', background: '#E5E7EB' }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div className={isLast ? '' : 'pb-4'}>
                <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                  {event.label}
                </p>
                <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                  {fmtDateTime(event.date)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
