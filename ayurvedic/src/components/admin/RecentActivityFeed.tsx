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
      className="overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <header className="flex items-center justify-between border-b border-[#1e3d32]/6 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Activity className="h-3.5 w-3.5 text-[#2F5D50]" />
          <h2 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
            Recent activity
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F5D50]/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F5D50] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2F5D50]" />
          </span>
          Live
        </span>
      </header>
      {events.length === 0 ? (
        <p className="px-5 py-8 text-center font-body text-[12.5px] italic text-[#2B2B2B]/55">
          No recent activity.
        </p>
      ) : (
        <ul className="divide-y divide-[#1e3d32]/6">
          {events.map((e) => {
            const Icon = ICONS[e.kind]
            return (
              <li key={e.id}>
                <Link
                  href={e.href}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#FAF6EE]/40"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
                    <Icon className="h-3.5 w-3.5 text-[#2F5D50]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-[12.5px] font-semibold text-[#1e3d32]">
                      {e.title}
                    </p>
                    <p className="truncate font-body text-[11px] text-[#2B2B2B]/65">
                      {e.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 font-body text-[10.5px] text-[#1e3d32]/45">
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
