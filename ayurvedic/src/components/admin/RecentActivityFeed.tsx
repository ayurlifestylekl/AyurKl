'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Package,
  Calendar,
  MessageSquare,
  MessageCircleReply,
  Gift,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityEvent } from '@/lib/admin/activity'

const ICONS: Record<ActivityEvent['kind'], LucideIcon> = {
  order: Package,
  appointment: Calendar,
  ticket: MessageSquare,
  reply: MessageCircleReply,
  promo_claim: Gift,
}

function ago(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function RecentActivityFeed({ initial }: { initial: ActivityEvent[] }) {
  const [events] = useState(initial)

  // Realtime: any new INSERT on the 5 source tables triggers a full reload.
  // Crude but reliable — server re-fetches and the merged feed regenerates.
  useEffect(() => {
    const supabase = createClient()
    const refresh = () => {
      if (typeof window !== 'undefined') window.location.reload()
    }
    const channel = supabase
      .channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'customer_promos' }, refresh)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <article
      className="overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
      }}
    >
      <header className="flex items-center justify-between border-b border-[#163F33]/6 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Activity className="h-3.5 w-3.5 text-[#1E5B4B]" />
          <h2 className="font-heading text-[13px] font-semibold text-[#163F33]">
            Recent activity
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5B4B]/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1E5B4B] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1E5B4B]" />
          </span>
          Live
        </span>
      </header>
      {events.length === 0 ? (
        <p className="px-5 py-8 text-center font-body text-[12.5px] italic text-[#1F1F1F]/55">
          No recent activity.
        </p>
      ) : (
        <ul className="divide-y divide-[#163F33]/6">
          {events.map((e) => {
            const Icon = ICONS[e.kind]
            return (
              <li key={e.id}>
                <Link
                  href={e.href}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#F7F2E8]/40"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#163F33]/[0.06]">
                    <Icon className="h-3.5 w-3.5 text-[#1E5B4B]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-[12.5px] font-semibold text-[#163F33]">
                      {e.title}
                    </p>
                    <p className="truncate font-body text-[11px] text-[#1F1F1F]/65">
                      {e.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 font-body text-[10.5px] text-[#163F33]/45">
                    {ago(e.at)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
