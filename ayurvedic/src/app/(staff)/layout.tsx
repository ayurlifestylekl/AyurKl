import Link from 'next/link'
import { requireStaff } from '@/lib/staff/guard'

export const dynamic = 'force-dynamic'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireStaff()
  const isDoctor = role === 'doctor' || role === 'admin'
  const isConsole = role === 'front_desk' || role === 'admin'

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-accent/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href={isConsole ? '/console' : '/doctor'} className="font-heading text-[15px] font-extrabold tracking-tight text-primary">
              Kerala Ayurvedic <span className="text-accent">· Clinic</span>
            </Link>
            <nav className="flex items-center gap-4 font-heading text-[11px] font-bold uppercase tracking-[0.14em]">
              {isConsole && (
                <Link href="/console" className="text-dark/60 hover:text-primary">Console</Link>
              )}
              {isDoctor && (
                <Link href="/doctor" className="text-dark/60 hover:text-primary">Doctor</Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-accent/30 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
              {role.replace('_', ' ')}
            </span>
            <Link href="/" className="font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/50 hover:text-primary">
              ↗ Site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6">{children}</main>
    </div>
  )
}
