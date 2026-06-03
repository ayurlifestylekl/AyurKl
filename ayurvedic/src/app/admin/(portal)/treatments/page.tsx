import Link from 'next/link'
import { ExternalLink, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Treatments · Admin' }

export default function AdminTreatmentsRedirectPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link
        href="/admin/appointments"
        className="text-[11px] uppercase tracking-wider text-[#163F33]/55 hover:text-[#D4AF37]"
      >
        ← Back to appointments
      </Link>
      <header>
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
          Catalog
        </span>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#163F33]">
          Treatments
        </h1>
        <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
          Manage treatment offerings — names, durations, descriptions, categories.
        </p>
      </header>

      <article
        className="rounded-2xl border border-[#D4AF37]/30 bg-[#F7F2E8]/60 p-5"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
        }}
      >
        <h2 className="font-heading text-[16px] font-semibold text-[#163F33]">
          Treatments live in Sanity Studio
        </h2>
        <p className="mt-2 text-[13px] text-[#1F1F1F]/70">
          Treatment content — title, duration, description, category, &quot;requires
          consultation&quot; flag — is managed inside <strong>Sanity Studio</strong>,
          our content-management system. Changes there flow to the public{' '}
          <Link href="/treatments" className="underline">
            /treatments
          </Link>{' '}
          page automatically (cached ~30 seconds) and appear in the walk-in appointment
          form&apos;s treatment picker.
        </p>
        <p className="mt-3 text-[13px] text-[#1F1F1F]/70">
          To add or edit treatments, open Sanity Studio:
        </p>
        <Link
          href="/studio"
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1E5B4B] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#163F33]"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open Sanity Studio
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </article>

      <article className="rounded-2xl border border-[#163F33]/8 bg-white p-5">
        <h3 className="font-heading text-[13px] font-semibold text-[#163F33]">
          Why not in the admin panel directly?
        </h3>
        <p className="mt-2 text-[12.5px] text-[#1F1F1F]/65">
          Treatments need rich content (descriptions, categorisation, &quot;requires
          consultation&quot; flag) and live alongside the marketing pages. Sanity is the
          right tool for that. The admin panel reads treatment names from Sanity to
          populate dropdowns &mdash; nothing duplicated, single source of truth.
        </p>
      </article>
    </div>
  )
}
