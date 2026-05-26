import Image from 'next/image'

import { urlForImage } from '@/sanity/image'
import type { SanityImageRef } from '@/types/treatments'

interface TherapyGalleryProps {
  images: SanityImageRef[]
}

export default function TherapyGallery({ images }: TherapyGalleryProps) {
  if (images.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded">
          <Image
            src={urlForImage(img).width(500).height(500).fit('crop').url()}
            alt={img.alt ?? `Treatment gallery image ${i + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, 200px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
