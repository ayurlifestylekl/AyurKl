import { createClient } from '@/lib/supabase/server'
import { getSiteSettings } from '@/lib/admin/settings/queries'
import SettingsForm from './SettingsForm'

export const metadata = { title: 'Settings · Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const settings = await getSiteSettings(supabase)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <header>
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
          Configuration
        </span>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#6E1023]">
          Settings
        </h1>
        <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
          Clinic-wide configuration — name, contact, tax, shipping, and booking rules.
          {settings.updatedAt ? (
            <>
              {' '}
              Last updated{' '}
              {new Date(settings.updatedAt).toLocaleString('en-MY')}.
            </>
          ) : null}
        </p>
      </header>

      <SettingsForm initial={settings} />
    </div>
  )
}
