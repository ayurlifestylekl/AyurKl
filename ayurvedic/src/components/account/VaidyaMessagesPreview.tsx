import Link from 'next/link'
import { Inbox, MessageCircle, ArrowUpRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { getLatestClinicMessage } from '@/lib/support/queries'
import { previewBody, relativeTime } from '@/lib/support/format'
import { CLINIC_LONG_NAME } from '@/lib/clinic'

/**
 * Dashboard preview of the customer's most recent clinic-authored message.
 * Auto-seeded on signup, so this card is alive from the first visit.
 */
export default async function VaidyaMessagesPreview() {
  const me = await getCurrentUser()
  const customerId = me?.authId ?? ''

  const supabase = await createClient()
  const latest = customerId
    ? await getLatestClinicMessage(supabase, customerId)
    : null

  const href = latest
    ? `/account/messages/${latest.ticket.id}`
    : '/account/messages'

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#D4A373]/35 sm:p-6"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
            <Inbox className="h-4 w-4 text-[#2F5D50]" strokeWidth={1.8} />
          </span>
          <div>
            <p className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1e3d32]/55">
              Messages & support
            </p>
            <p
              className="font-heading text-[14px] font-bold text-[#1e3d32]"
              style={{ letterSpacing: '-0.005em' }}
            >
              {latest ? 'A note from the clinic' : 'Messages from the clinic'}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-[#1e3d32]/35 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D4A373]"
          strokeWidth={2}
        />
      </div>

      {latest ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#D4A373]/25 bg-[#FAF6EE]/55 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4A373]/15">
            <MessageCircle className="h-4 w-4 text-[#D4A373]" strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p
                className="truncate font-heading text-[12.5px] font-semibold text-[#1e3d32]"
                style={{ letterSpacing: '-0.005em' }}
              >
                {CLINIC_LONG_NAME}
              </p>
              <span className="shrink-0 font-body text-[10px] text-[#2B2B2B]/45">
                {relativeTime(latest.message.created_at)}
              </span>
            </div>
            <p
              className="mt-1 font-body text-[12px] italic text-[#2B2B2B]/65"
              style={{ lineHeight: 1.55 }}
            >
              {previewBody(latest.message.body, 160)}
            </p>
          </div>
        </div>
      ) : (
        <p
          className="mt-4 font-body text-[12px] text-[#2B2B2B]/65"
          style={{ lineHeight: 1.55 }}
        >
          When the clinic replies, you&apos;ll see it here. Tap to open your inbox.
        </p>
      )}
    </Link>
  )
}
