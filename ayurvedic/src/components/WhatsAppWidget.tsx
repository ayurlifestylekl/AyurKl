'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppWidget() {
  return (
    <a
      href="https://wa.me/601165043436"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2"
    >
      {/* Tooltip */}
      <span className="pointer-events-none hidden max-w-[0] overflow-hidden whitespace-nowrap rounded-full bg-[#2B2B2B] px-3 py-1.5 text-sm text-white opacity-0 transition-all duration-300 group-hover:max-w-xs group-hover:opacity-100 sm:block">
        Chat with us
      </span>

      {/* Button */}
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95">
        <MessageCircle className="h-7 w-7 fill-white text-white" />
      </span>
    </a>
  )
}
