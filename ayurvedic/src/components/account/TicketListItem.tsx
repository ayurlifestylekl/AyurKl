import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import TicketStatusPill from './TicketStatusPill'
import TicketTopicChip from './TicketTopicChip'
import { previewBody, relativeTime } from '@/lib/support/format'
import type { TicketWithLatest } from '@/lib/support/queries'

interface TicketListItemProps {
  ticket: TicketWithLatest
}

export default function TicketListItem({ ticket }: TicketListItemProps) {
  const href = `/account/messages/${ticket.id}`
  const isUnread = ticket.unread_by_customer
  const preview = ticket.latest ? previewBody(ticket.latest.body) : 'No messages yet.'

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 overflow-hidden border-b border-[#6E1023]/6 bg-white px-5 py-4 transition-colors hover:bg-[#F7F2E8]/45 sm:px-6 last:border-b-0"
    >
      {/* Unread indicator dot */}
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${
          isUnread ? 'bg-[#D4AF37]' : 'bg-transparent'
        }`}
      />

      <div className="flex flex-1 min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <TicketTopicChip topic={ticket.topic} />
          <TicketStatusPill status={ticket.status} />
          <span className="ml-auto font-body text-[11px] text-[#1F1F1F]/45">
            {relativeTime(ticket.last_message_at)}
          </span>
        </div>
        <h3
          className={`truncate font-heading text-[14px] ${
            isUnread ? 'font-bold text-[#6E1023]' : 'font-semibold text-[#6E1023]/85'
          }`}
          style={{ letterSpacing: '-0.005em' }}
        >
          {ticket.subject}
        </h3>
        <p
          className="truncate font-body text-[12px] text-[#1F1F1F]/60"
          style={{ lineHeight: 1.55 }}
        >
          {preview}
        </p>
      </div>

      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-[#6E1023]/35 transition-all group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
        strokeWidth={2}
      />
    </Link>
  )
}
