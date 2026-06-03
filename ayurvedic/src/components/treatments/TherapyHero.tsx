import Image from 'next/image'

import { urlForImage } from '@/sanity/image'
import type { SanityImageRef } from '@/types/treatments'

interface TherapyHeroProps {
  image: SanityImageRef | null
  categoryTitle: string
  treatmentOrder: number | null
  treatmentTitle: string
}

export default function TherapyHero({
  image,
  categoryTitle,
  treatmentOrder,
  treatmentTitle,
}: TherapyHeroProps) {
  const number =
    treatmentOrder != null ? String(treatmentOrder + 1).padStart(2, '0') : null
  const tagText = number ? `${categoryTitle} · No. ${number}` : categoryTitle

  return (
    <div className="relative w-full overflow-hidden bg-primary">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
        {image ? (
          <Image
            src={urlForImage(image).width(2400).fit('crop').url()}
            alt={image.alt ?? `${treatmentTitle} hero image`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-primary"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(212, 175, 55,0.12) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <p className="font-body text-[15px] italic text-white/60">
              Photo coming soon
            </p>
          </div>
        )}
        <div className="absolute left-4 top-4 max-w-[80%] truncate bg-primary/85 px-3 py-1.5 text-accent sm:left-6 sm:top-6">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em]">
            {tagText}
          </span>
        </div>
      </div>
    </div>
  )
}
