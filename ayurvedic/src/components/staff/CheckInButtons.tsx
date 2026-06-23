'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingStatus } from '@/types/booking'
import { setStatus } from '@/lib/staff/actions'

/** Inline quick-action buttons for the front-desk Today board. */
export default function CheckInButtons({ id, status }: { id: string; status: BookingStatus }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const move = (to: BookingStatus) =>
    start(async () => {
      const res = await setStatus(id, to)
      if (!('error' in res)) router.refresh()
      else alert(res.error)
    })

  if (status === 'completed') {
    return <span className="font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-green-700">Done</span>
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status === 'confirmed' && <Btn onClick={() => move('checked_in')} disabled={pending}>Check in</Btn>}
      {status === 'checked_in' && <Btn onClick={() => move('in_progress')} disabled={pending}>Start</Btn>}
      {status === 'in_progress' && <Btn onClick={() => move('completed')} disabled={pending}>Complete</Btn>}
      {(status === 'confirmed' || status === 'checked_in') && (
        <Btn onClick={() => move('no_show')} disabled={pending} danger>No-show</Btn>
      )}
    </div>
  )
}

function Btn({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
        danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-accent/40 text-primary hover:bg-cream'
      }`}
    >
      {children}
    </button>
  )
}
