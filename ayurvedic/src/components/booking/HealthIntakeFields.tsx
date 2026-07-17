'use client'

import type { Gender, HealthIntake } from '@/types/booking'

interface HealthIntakeFieldsProps {
  value: HealthIntake
  onChange: (v: HealthIntake) => void
  gender: Gender | ''
  /** Render just the fields (no section chrome) — for embedding in a guest card. */
  embedded?: boolean
  /** Unique radio-group name when several intakes render on one page (one per guest). */
  radioGroup?: string
}

/** Brief pre-visit health intake. Always shown so the Vaidya always has context. */
export default function HealthIntakeFields({ value, onChange, gender, embedded = false, radioGroup = 'onPeriod' }: HealthIntakeFieldsProps) {
  const set = (patch: Partial<HealthIntake>) => onChange({ ...value, ...patch })

  const fields = (
    <div className="grid gap-3">
      <Field label="Existing conditions">
        <textarea
          rows={2}
          value={value.conditions ?? ''}
          onChange={(e) => set({ conditions: e.target.value })}
          placeholder="e.g. high blood pressure, diabetes, recent surgery"
          className={inputCls}
        />
      </Field>
      <Field label="Allergies">
        <input
          value={value.allergies ?? ''}
          onChange={(e) => set({ allergies: e.target.value })}
          placeholder="e.g. nuts, dairy, specific herbs"
          className={inputCls}
        />
      </Field>
      <Field label="Current medications">
        <input
          value={value.medications ?? ''}
          onChange={(e) => set({ medications: e.target.value })}
          placeholder="e.g. blood thinners, supplements"
          className={inputCls}
        />
      </Field>
      {gender === 'female' && (
        <>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={value.pregnant ?? false}
              onChange={(e) => set({ pregnant: e.target.checked })}
              className="h-4 w-4 accent-[#1e5b4b]"
            />
            <span className="font-body text-[13px] text-dark/80">
              {embedded ? 'Pregnant or may be pregnant' : 'I am pregnant or may be pregnant'}
            </span>
          </label>
          <div>
            <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
              Menstruation
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={radioGroup}
                  checked={value.onPeriod === 'yes'}
                  onChange={() => set({ onPeriod: 'yes' })}
                  className="h-4 w-4 accent-[#1e5b4b]"
                />
                <span className="font-body text-[13px] text-dark/80">{embedded ? 'On period' : 'I am on my period'}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={radioGroup}
                  checked={value.onPeriod === 'no'}
                  onChange={() => set({ onPeriod: 'no' })}
                  className="h-4 w-4 accent-[#1e5b4b]"
                />
                <span className="font-body text-[13px] text-dark/80">{embedded ? 'Not on period' : 'I am not on my period'}</span>
              </label>
            </div>
          </div>
        </>
      )}
      <Field label="Anything else we should know">
        <textarea
          rows={2}
          value={value.notes ?? ''}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Concerns, goals, or areas to focus on"
          className={inputCls}
        />
      </Field>
    </div>
  )

  if (embedded) return fields

  return (
    <fieldset className="rounded-xl border border-accent/25 bg-white/60 p-5">
      <legend className="px-1 font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
        Health intake
      </legend>
      <p className="mb-3 font-body text-[12px] italic text-dark/55">
        So our Vaidya can tailor and safely plan your therapy. Leave blank if not applicable.
      </p>
      {fields}
    </fieldset>
  )
}

const inputCls =
  'w-full rounded-lg border border-accent/30 bg-white px-3 py-2 font-body text-[14px] text-dark placeholder:text-dark/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
        {label}
      </span>
      {children}
    </label>
  )
}
