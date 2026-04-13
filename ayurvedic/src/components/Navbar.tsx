'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User, Leaf, ChevronDown, Phone, Mail } from 'lucide-react'

const productsDropdown = [
  { label: 'All Products',     href: '/products'                 },
  { label: 'Treatment Combos', href: '/products?category=combos' },
  { label: 'Herbal Remedies',  href: '/products?category=herbal' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [dropdownOpen, setDropdownOpen]     = useState(false)
  const [mobileProducts, setMobileProducts] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkCls = 'px-4 py-2 font-heading text-[13px] font-semibold uppercase tracking-wider text-white/70 rounded-full transition-colors duration-200 hover:text-white hover:bg-white/10 whitespace-nowrap'

  return (
    <header className="sticky top-0 z-40 w-full">

      {/* ── Top Info Bar ── */}
      <div className="bg-[#152b22] border-b border-[#D4A373]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

          {/* Left: contact */}
          <div className="hidden items-center gap-5 md:flex">
            <a href="tel:+60123456789" className="flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-[#D4A373]">
              <Phone className="h-3 w-3 text-[#D4A373]" />
              +60 12-345 6789
            </a>
            <span className="h-3 w-px bg-white/10" />
            <a href="mailto:info@keralaayurvedic.com" className="flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-[#D4A373]">
              <Mail className="h-3 w-3 text-[#D4A373]" />
              info@keralaayurvedic.com
            </a>
          </div>
          <p className="text-xs text-white/40 md:hidden">Kerala Ayurvedic Lifestyle</p>

          {/* Right: social */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/35 sm:block">Follow Us:</span>
            <div className="flex items-center gap-2">
              <a href="#" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4A373]">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4A373]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4A373]">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="bg-[#f7f3ee] shadow-md shadow-black/8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3d32]/10 ring-1 ring-[#1e3d32]/20 transition-all duration-300 group-hover:bg-[#1e3d32]/15">
              <Leaf className="h-5 w-5 text-[#1e3d32]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-[#1e3d32]">Kerala</span>
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-[#1e3d32]">Ayurvedic</span>
            </div>
          </Link>

          {/* ── Desktop: Nav pill container ── */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-0.5 rounded-full bg-[#1e3d32] px-2 py-1.5 shadow-lg shadow-[#1e3d32]/20">

              {/* Home */}
              <Link href="/" className={linkCls}>Home</Link>

              {/* About */}
              <Link href="/about" className={linkCls}>About Us</Link>

              {/* Treatments */}
              <Link href="/treatments" className={linkCls}>Treatments</Link>

              {/* Products dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className={`${linkCls} flex items-center gap-1 focus:outline-none`}
                >
                  Products
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-1/2 top-full mt-2 w-52 -translate-x-1/2">
                    <div className="overflow-hidden rounded-2xl border border-[#D4A373]/20 bg-[#1e3d32] shadow-2xl shadow-black/40">
                      {productsDropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 border-b border-white/8 px-5 py-3 last:border-0 transition-colors hover:bg-white/8"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A373]/60" />
                          <span className="font-heading text-[13px] font-medium text-white/80 hover:text-white">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blog */}
              <Link href="/blog" className={linkCls}>Blog</Link>

              {/* Contact */}
              <Link href="/contact" className={linkCls}>Contact</Link>

              {/* ── Book Now pill (inside the nav container) ── */}
              <Link
                href="/book"
                className="ml-1 rounded-full bg-[#D4A373] px-5 py-2 font-heading text-[13px] font-bold uppercase tracking-wider text-[#1a1a1a] transition-all duration-200 hover:bg-[#c4935f] active:scale-95 whitespace-nowrap"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* ── Right: Search pill + User pill ── */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Cart pill */}
            <Link href="/cart" className="flex items-center gap-2 rounded-full bg-[#D4A373] px-4 py-2 hover:bg-[#c4935f]">
              <span className="font-heading text-[13px] font-semibold text-white">Cart</span>
              <ShoppingCart className="h-3.5 w-3.5 text-white" />
            </Link>
            {/* User pill */}
            <Link
              href="/auth/login"
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4A373] transition-all duration-200 hover:bg-[#c4935f]"
            >
              <User className="h-4 w-4 text-white" />
            </Link>
          </div>

          {/* ── Mobile: hamburger ── */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart" aria-label="Cart" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3d32]/10 text-[#1e3d32] hover:bg-[#1e3d32]/20">
              <ShoppingCart className="h-4.5 w-4.5" />
            </Link>
            <button
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3d32] text-white"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="bg-[#1e3d32] md:hidden">
          <ul className="flex flex-col px-4 py-3">

            <li className="border-b border-white/8">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373]">
                Home
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373]">
                About Us
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/treatments" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373]">
                Treatments
              </Link>
            </li>

            {/* Products accordion */}
            <li className="border-b border-white/8">
              <button
                onClick={() => setMobileProducts((p) => !p)}
                className="flex w-full items-center justify-between py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373] focus:outline-none"
              >
                Products
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileProducts ? 'rotate-180 text-[#D4A373]' : ''}`} />
              </button>
              {mobileProducts && (
                <ul className="mb-3 space-y-1 border-l-2 border-[#D4A373]/30 pl-4">
                  {productsDropdown.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { setMobileOpen(false); setMobileProducts(false) }}
                        className="flex items-center gap-2 py-2 font-heading text-sm text-white/55 transition-colors hover:text-[#D4A373]"
                      >
                        <span className="h-1 w-1 rounded-full bg-[#D4A373]/50" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className="border-b border-white/8">
              <Link href="/blog" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373]">
                Blog
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4A373]">
                Contact
              </Link>
            </li>

            {/* CTA row */}
            <li className="mt-4 flex items-center gap-3 pb-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/book"
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center rounded-full bg-[#D4A373] py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-[#1a1a1a] transition-all hover:bg-[#c4935f]"
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
