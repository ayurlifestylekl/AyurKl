'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ShieldCheck, ArrowRight, Terminal } from 'lucide-react'
import { signInWithPassword } from '@/actions/auth/signInWithPassword'

interface AdminLoginFormProps {
  resetSuccess?: boolean
  nextPath?: string
}

/**
 * Command Center sign-in.
 * Deliberately distinct from /auth/login: charcoal canvas, sharper corners,
 * monospaced eyebrow, scanline texture, status indicator. Reads like a
 * staff terminal, not a consumer card.
 */
export default function AdminLoginForm({ resetSuccess, nextPath }: AdminLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await signInWithPassword(email, password)
      if (res.ok) {
        router.push(res.redirectTo ?? nextPath ?? '/admin/dashboard')
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="w-full">
      {/* Card — sharp corners, almost-black charcoal, scanlines */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1411]"
        style={{
          boxShadow:
            '0 24px 60px -18px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Scanline texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
          }}
        />
        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top status bar */}
        <div className="relative flex items-center justify-between border-b border-white/8 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
          <div className="flex items-center gap-2">
            <Terminal className="h-3 w-3 text-[#2E7D5A]" />
            <span>[ command center ]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E7D5A] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2E7D5A]" />
            </span>
            <span>secure</span>
          </div>
        </div>

        {/* Body */}
        <div className="relative p-7 sm:p-8">
          <h1
            className="font-heading text-[26px] font-bold leading-tight text-white"
            style={{ letterSpacing: '-0.025em' }}
          >
            Staff sign-in.
          </h1>
          <p className="mt-2 font-body text-[13px] leading-relaxed text-white/55">
            Restricted to authorised personnel. If you don&apos;t have an admin account, you&apos;re in the wrong place.
          </p>

          {resetSuccess && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-400/35 bg-green-400/[0.07] px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-300" />
              <p className="font-body text-[12px] text-white/85">
                Password reset. Sign in with your new password.
              </p>
            </div>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.05] px-4 py-2.5">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/55">
              all sessions logged · device-fingerprinted
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <TerminalInput
              label="Staff email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={email.trim()}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="admin@keralaayurvedic.com"
            />
            <TerminalInput
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-[#D4AF37]"
              >
                forgot password?
              </Link>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-red-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-7 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#0a1411] transition-all duration-200 hover:bg-white/90 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1411] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? 'authenticating…' : 'enter command center'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Cross-link */}
      <div className="mt-5 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/35">
        not staff?{' '}
        <Link
          href="/auth/login"
          className="text-[#D4AF37] underline-offset-4 transition-colors hover:text-[#e1b487] hover:underline"
        >
          → member sign-in
        </Link>
      </div>
    </div>
  )
}

/**
 * Terminal-flavoured input — thinner, sharper corners, uppercase mono label.
 */
function TerminalInput({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputId = `t-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {label}
      </span>
      <input
        id={inputId}
        className="block w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-mono text-[13px] text-white placeholder:text-white/30 transition-colors duration-200 hover:border-white/25 focus:border-white/45 focus:bg-black/40 focus:outline-none focus:ring-1 focus:ring-white/20"
        {...rest}
      />
    </label>
  )
}
