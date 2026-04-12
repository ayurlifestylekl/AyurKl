'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronDown, Loader2, Send } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import { fadeUp, inViewOnce, slideIn } from '@/lib/motion'
import { submitContactMessage, type ContactIntent } from '@/actions/contact'

const INTENT_OPTIONS: Array<{ value: ContactIntent; label: string }> = [
  { value: 'treatment', label: 'Treatment Inquiry' },
  { value: 'product', label: 'Product / Ayur-Store Question' },
  { value: 'corporate', label: 'Corporate / Partnership' },
  { value: 'other', label: 'Other' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputClass =
  'peer w-full border-b border-primary/15 bg-transparent pb-3 pt-2 font-body text-[16px] text-dark placeholder:text-dark/30 transition-colors duration-300 focus:border-accent focus:outline-none'

export default function ContactForm() {
  const [intent, setIntent] = useState<ContactIntent>('treatment')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Read ?intent=... from URL once on mount (no Suspense boundary needed).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const param = params.get('intent')
    if (
      param === 'treatment' ||
      param === 'product' ||
      param === 'corporate' ||
      param === 'other'
    ) {
      setIntent(param)
    }
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage(null)
    startTransition(async () => {
      const result = await submitContactMessage({
        intent,
        name,
        phone: phone.startsWith('+60') ? phone : `+60 ${phone}`,
        email,
        message,
      })
      if (result.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(result.error)
      }
    })
  }

  function handleReset() {
    setStatus('idle')
    setIntent('treatment')
    setName('')
    setPhone('')
    setEmail('')
    setMessage('')
    setErrorMessage(null)
  }

  const busy = status === 'loading' || isPending

  return (
    <section
      id="inquiry"
      aria-labelledby="inquiry-heading"
      className="relative overflow-hidden bg-[#FAF6EE] scroll-mt-24"
    >
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 90% 10%, rgba(212,163,115,0.1) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(122,157,84,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* LEFT — editorial context */}
          <motion.div
            variants={slideIn('left', 0)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="lg:col-span-5"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/55">
                  014
                </span>
                <span aria-hidden className="h-px w-8 bg-accent/60" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                  Write to us
                </span>
              </div>

              <h2
                id="inquiry-heading"
                className="font-heading text-[44px] font-extrabold leading-[1] tracking-[-0.022em] text-primary md:text-[56px]"
              >
                A note to
                <br />
                <span className="font-body italic font-normal text-accent">
                  the Vaidya.
                </span>
              </h2>

              <div className="flex flex-col gap-4 pt-2">
                <span aria-hidden className="h-px w-10 bg-accent" />
                <p className="max-w-md font-body text-[19px] italic leading-[1.65] text-dark/75">
                  &ldquo;Every note is read by me personally. I reply within one
                  working day.&rdquo;
                </p>
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                  — Vaidya AKHIL HS, B.A.M.S
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
                  Confidential
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
                  No newsletter spam
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
                  1-day reply
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — form card */}
          <motion.div
            variants={fadeUp(0.1)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white via-white to-[#FAF6EE] p-8 shadow-floating ring-1 ring-accent/25 sm:p-10 lg:p-12">
              {/* Frame-in-frame letterpress margin */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[14px] rounded-[14px] border border-accent/15"
              />

              <div className="relative z-10">
                {status === 'success' ? (
                  <SuccessNote onReset={handleReset} />
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-7"
                    noValidate
                  >
                    {/* Intent */}
                    <Field label="What is this about?" htmlFor="contact-intent">
                      <div className="relative">
                        <select
                          id="contact-intent"
                          value={intent}
                          onChange={(e) =>
                            setIntent(e.target.value as ContactIntent)
                          }
                          required
                          className="w-full cursor-pointer appearance-none border-b border-primary/15 bg-transparent pb-3 pr-8 pt-2 font-heading text-[14px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors duration-300 focus:border-accent focus:outline-none"
                        >
                          {INTENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden
                          className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-accent"
                          strokeWidth={2.4}
                        />
                      </div>
                    </Field>

                    {/* Name */}
                    <Field label="Your name" htmlFor="contact-name">
                      <input
                        id="contact-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Kumar"
                        autoComplete="name"
                        className={inputClass}
                      />
                    </Field>

                    {/* Phone with +60 prefix */}
                    <Field label="Phone number" htmlFor="contact-phone">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 -translate-y-1/2 font-heading text-[13px] font-bold text-primary/60"
                        >
                          +60
                        </span>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          minLength={8}
                          maxLength={30}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="11 6504 3436"
                          autoComplete="tel"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>

                    {/* Email */}
                    <Field label="Email address" htmlFor="contact-email">
                      <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={200}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@example.com"
                        autoComplete="email"
                        className={inputClass}
                      />
                    </Field>

                    {/* Message */}
                    <Field label="Your message" htmlFor="contact-message">
                      <div className="relative">
                        <textarea
                          id="contact-message"
                          required
                          minLength={10}
                          maxLength={2000}
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us what you need help with…"
                          className={`${inputClass} resize-y`}
                        />
                        <span className="pointer-events-none absolute -bottom-4 right-0 font-heading text-[9.5px] font-semibold tracking-[0.12em] text-primary/40">
                          {message.length}/2000
                        </span>
                      </div>
                    </Field>

                    {/* Error */}
                    {status === 'error' && errorMessage && (
                      <p
                        className="rounded-[10px] border border-red-700/20 bg-red-700/5 px-4 py-3 font-body text-[13px] italic leading-[1.6] text-red-800"
                        role="alert"
                      >
                        {errorMessage}
                      </p>
                    )}

                    {/* Submit */}
                    <div className="flex flex-col items-start gap-4 pt-4">
                      <CTAButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        shimmer
                        iconRight={
                          busy ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              strokeWidth={2.4}
                            />
                          ) : (
                            <Send className="h-4 w-4" strokeWidth={2.4} />
                          )
                        }
                      >
                        {busy ? 'Sending…' : 'Send message'}
                      </CTAButton>
                      <p className="font-body text-[13px] italic leading-[1.6] text-dark/55">
                        Your details stay with us. We never share contact info
                        with third parties.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-heading text-[9.5px] font-bold uppercase tracking-[0.22em] text-primary/55"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function SuccessNote({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-5 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 bg-accent/15">
        <Check className="h-6 w-6 text-primary" strokeWidth={2.4} />
      </div>
      <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
        Message received
      </span>
      <h3 className="font-heading text-[30px] font-extrabold leading-[1.1] tracking-[-0.022em] text-primary sm:text-[36px]">
        Thank you — I will reply
        <br />
        <span className="font-body italic font-normal text-accent">
          within one working day.
        </span>
      </h3>
      <p className="max-w-md font-body text-[15px] leading-[1.75] text-dark/70">
        Your note is with me now. If your matter is urgent, WhatsApp is the
        fastest channel — we answer within the hour during clinic hours.
      </p>
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
        — Vaidya AKHIL HS, B.A.M.S
      </span>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Send another message
      </button>
    </div>
  )
}
