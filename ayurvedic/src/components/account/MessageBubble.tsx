import { bubbleTimestamp, senderLabel } from '@/lib/support/format'
import type { SenderKind, SupportMessage } from '@/lib/support/format'

interface MessageBubbleProps {
  message: SupportMessage
  customerName?: string | null
}

export default function MessageBubble({ message, customerName }: MessageBubbleProps) {
  const kind: SenderKind = message.sender_kind
  const time = bubbleTimestamp(message.created_at)
  const label = senderLabel(kind, customerName)

  if (kind === 'system') {
    return (
      <li className="my-2 flex justify-center">
        <p className="rounded-full bg-[#6E1023]/[0.05] px-3 py-1 font-body text-[11px] italic text-[#1F1F1F]/55">
          {message.body}
          <span className="ml-2 text-[#6E1023]/35">· {time}</span>
        </p>
      </li>
    )
  }

  const isCustomer = kind === 'customer'

  return (
    <li className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[78%] ${isCustomer ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span
          className={`font-heading text-[10px] font-semibold uppercase tracking-[0.14em] ${
            isCustomer ? 'text-[#6E1023]/55' : 'text-[#D4AF37]'
          }`}
        >
          {label}
        </span>
        <div
          className={`rounded-3xl px-4 py-3 ${
            isCustomer
              ? 'rounded-tr-md bg-[#6E1023] text-white'
              : 'rounded-tl-md border border-[#D4AF37]/35 bg-[#F7F2E8]/55 text-[#6E1023]'
          }`}
          style={{
            boxShadow: isCustomer
              ? '0 1px 0 0 rgba(110,16,35,0.12), 0 12px 30px -18px rgba(110,16,35,0.35)'
              : '0 1px 0 0 rgba(110,16,35,0.04), 0 12px 30px -18px rgba(212, 175, 55,0.4)',
          }}
        >
          <p
            className="whitespace-pre-line font-body text-[13.5px]"
            style={{ lineHeight: 1.6 }}
          >
            {message.body}
          </p>
        </div>
        <span className="font-body text-[10.5px] text-[#1F1F1F]/45">{time}</span>
      </div>
    </li>
  )
}
