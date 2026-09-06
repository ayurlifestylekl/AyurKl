'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ShieldCheck, ArrowRight, Package } from 'lucide-react'
import { signInWithPassword } from '@/actions/auth/signInWithPassword'

interface ProductManagementLoginFormProps {
  resetSuccess?: boolean
  nextPath?: string
}

/**
 * Product Management sign-in. Deliberately its own gate — separate from
 * /admin/login — using the same dedicated visual language as the other
 * portal-specific logins (/agent/login, /doctor/login, /staff/login).
 */
export default function ProductManagementLoginForm({ resetSuccess, nextPath }: ProductManagementLoginFormProps) {
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
        router.push(res.redirectTo ?? nextPath ?? '/product-management')
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-2xl border border-[#1E5B4B]/20 bg-gradient-to-b from-[#123A30] to-[#0B241D]"
        style={{
          boxShadow:
            '0 34px 80px -28px rgba(2,10,8,0.9), 0 2px 14px -6px rgba(30,91,75,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.16), transparent 70%)' }}
        />

        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-[#D4AF37]" />
            <span>[ product management ]</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#D4AF37]/85">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            </span>
            <span>secure</span>
          </div>
        </div>

        <div className="relative p-7 sm:p-8">
          <h1
            className="font-heading text-[26px] font-bold leading-tight text-white"
            style={{ letterSpacing: '-0.025em' }}
          >
            Product Management.
          </h1>
          <p className="mt-2 font-body text-[13px] leading-relaxed text-white/60">
            Catalog, inventory, and order fulfillment — dedicated access, separate from the admin portal.
          </p>

          {resetSuccess && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/[0.07] px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
              <p className="font-body text-[12px] text-white/85">
                Password reset. Sign in with your new password.
              </p>
            </div>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-4 py-2.5">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/55">
              all sessions logged · device-fingerprinted
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <TerminalInput
              label="Product Management email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={email.trim()}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="product@keralaeverydaygymstore.com"
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
              className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-7 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#0B241D] transition-all duration-200 hover:brightness-[1.06] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B241D] disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: 'linear-gradient(180deg, #E6C75C 0%, #D4AF37 55%, #C0972A 100%)',
                boxShadow: '0 12px 28px -10px rgba(212,175,55,0.5), inset 0 1px 0 0 rgba(255,255,255,0.45)',
              }}
            >
              {isPending ? 'authenticating…' : 'enter product management'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-5 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/35">
        not product management?{' '}
        <Link
          href="/admin/login"
          className="text-[#D4AF37] underline-offset-4 transition-colors hover:text-[#e1b487] hover:underline"
        >
          → admin sign-in
        </Link>
      </div>
    </div>
  )
}

function TerminalInput({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputId = `pm-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]/70">
        {label}
      </span>
      <input
        id={inputId}
        className="block w-full rounded-xl border border-white/12 bg-[#081712]/60 px-4 py-3 font-mono text-[13px] text-white placeholder:text-white/25 transition-colors duration-200 hover:border-[#D4AF37]/30 focus:border-[#D4AF37]/55 focus:bg-[#081712]/85 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/25"
        {...rest}
      />
    </label>
  )
}
