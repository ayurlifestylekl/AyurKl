'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User, ChevronDown, ChevronRight, Phone, Mail, Sparkles } from 'lucide-react'
import { COMMERCE_ENABLED } from '@/lib/admin/features'

const productsDropdown = [
  { label: 'All Products',     href: '/products'                 },
  { label: 'Treatment Combos', href: '/products?category=combos' },
  { label: 'Herbal Remedies',  href: '/products?category=herbal' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]               = useState(false)
  const [dropdownOpen, setDropdownOpen]           = useState(false)
  const [accountDropdownOpen, setAccountDropdown] = useState(false)
  const [mobileProducts, setMobileProducts]       = useState(false)
  const dropdownRef        = useRef<HTMLDivElement>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkCls = 'px-4 py-2 font-heading text-[13px] font-semibold uppercase tracking-wider text-white/70 rounded-full transition-colors duration-200 hover:text-white hover:bg-white/10 whitespace-nowrap'

  return (
    <header className="sticky top-0 z-40 w-full">

      {/* ── Top Info Bar ── */}
      <div className="bg-[#4A0C18] border-b border-[#D4AF37]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

          {/* Left: contact */}
          <div className="hidden items-center gap-5 md:flex">
            <a href="tel:+60322603436" className="flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-[#D4AF37]">
              <Phone className="h-3 w-3 text-[#D4AF37]" />
              +60 3-2260 3436
            </a>
            <span className="h-3 w-px bg-white/10" />
            <a href="mailto:info@keralaayurvediclifestyle.com.my" className="flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-[#D4AF37]">
              <Mail className="h-3 w-3 text-[#D4AF37]" />
              info@keralaayurvediclifestyle.com.my
            </a>
          </div>
          <p className="text-xs text-white/40 md:hidden">Kerala Ayurvedic Lifestyle</p>

          {/* Right: social */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/35 sm:block">Follow Us:</span>
            <div className="flex items-center gap-2">
              <a href="https://www.facebook.com/KeralaAyurvedicLifestyle" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4AF37]">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/keralaayurvediclifestyle/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4AF37]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="flex h-6 w-6 items-center justify-center text-white/45 transition-colors hover:text-[#D4AF37]">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="bg-[#F7F2E8] shadow-md shadow-black/8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            aria-label="Kerala Ayurvedic Lifestyle — home"
            className="group -ml-1 flex shrink-0 items-center gap-3 sm:-ml-3"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/kerala-logo.jpg"
              alt="Kerala Ayurvedic Lifestyle"
              width={1024}
              height={900}
              priority
              className="h-10 w-auto rounded-md transition-transform duration-300 group-hover:scale-[1.03] sm:h-11"
            />
          </Link>

          {/* ── Desktop: Nav pill container ── */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-0.5 rounded-full bg-[#4A0C18] px-2 py-1.5 shadow-lg shadow-[#4A0C18]/20">

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
                    <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#4A0C18] shadow-2xl shadow-black/40">
                      {productsDropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 border-b border-white/8 px-5 py-3 last:border-0 transition-colors hover:bg-white/8"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]/60" />
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
                className="ml-1 rounded-full bg-[linear-gradient(135deg,#F6DD8E_0%,#E7C457_30%,#D4AF37_52%,#B8860B_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] px-5 py-2 font-heading text-[13px] font-bold uppercase tracking-wider text-[#3A1208] transition-all duration-200 hover:-translate-y-px active:scale-95 whitespace-nowrap"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* ── Right: Search pill + User pill ── */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Cart pill */}
            <Link href="/cart" className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F6DD8E_0%,#E7C457_30%,#D4AF37_52%,#B8860B_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] px-4 py-2 transition-transform duration-200 hover:-translate-y-px">
              <span className="font-heading text-[13px] font-semibold text-[#3A1208]">Cart</span>
              <ShoppingCart className="h-3.5 w-3.5 text-[#3A1208]" />
            </Link>
            {/* User pill — dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdown((p) => !p)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={accountDropdownOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6DD8E_0%,#E7C457_30%,#D4AF37_52%,#B8860B_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-200 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F2E8]"
              >
                <User className="h-4 w-4 text-[#3A1208]" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-[336px] origin-top-right">
                  <div
                    className="relative overflow-hidden rounded-[28px] border border-[#D4AF37]/25 bg-gradient-to-b from-[#4A0C18] via-[#4A0C18] to-[#4A0C18]"
                    style={{
                      boxShadow:
                        '0 24px 60px -18px rgba(0,0,0,0.55), 0 8px 20px -10px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Grain overlay for depth */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6' /></svg>\")",
                      }}
                    />

                    {/* Eyebrow rule */}
                    <div className="relative flex items-center gap-3 px-6 pt-5 pb-3">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                      <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/85">
                        Sign in as
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                    </div>

                    {/* Item 1 — Wellness Member */}
                    <Link
                      href="/auth/login"
                      onClick={() => setAccountDropdown(false)}
                      className="group relative flex items-center gap-4 border-b border-white/[0.06] px-6 py-4 transition-colors duration-200 hover:bg-white/[0.035]"
                    >
                      <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r-full bg-[#D4AF37] transition-[height] duration-300 group-hover:h-9" />
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] transition-colors duration-200 group-hover:border-[#D4AF37]/55 group-hover:bg-[#D4AF37]/[0.14]">
                        <User className="h-[18px] w-[18px] text-[#D4AF37]" strokeWidth={1.6} />
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span
                          className="font-heading text-[14px] font-semibold text-white"
                          style={{ letterSpacing: '-0.005em' }}
                        >
                          Wellness Member
                        </span>
                        <span
                          className="font-body text-[11.5px] text-white/55"
                          style={{ lineHeight: 1.55 }}
                        >
                          Track orders & consultations
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 -translate-x-2 text-[#D4AF37]/0 transition-[transform,color] duration-300 group-hover:translate-x-0 group-hover:text-[#D4AF37]/85"
                        strokeWidth={2}
                      />
                    </Link>

                    {/* Item 2 — Brand Partner (archived until the affiliate program launches) */}
                    {COMMERCE_ENABLED && (
                    <Link
                      href="/partners"
                      onClick={() => setAccountDropdown(false)}
                      className="group relative flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-white/[0.035]"
                    >
                      <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r-full bg-[#D4AF37] transition-[height] duration-300 group-hover:h-9" />
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] transition-colors duration-200 group-hover:border-[#D4AF37]/55 group-hover:bg-[#D4AF37]/[0.14]">
                        <Sparkles className="h-[18px] w-[18px] text-[#D4AF37]" strokeWidth={1.6} />
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span
                          className="font-heading text-[14px] font-semibold text-white"
                          style={{ letterSpacing: '-0.005em' }}
                        >
                          Brand Partner
                        </span>
                        <span
                          className="font-body text-[11.5px] text-white/55"
                          style={{ lineHeight: 1.55 }}
                        >
                          Affiliate program for creators
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 -translate-x-2 text-[#D4AF37]/0 transition-[transform,color] duration-300 group-hover:translate-x-0 group-hover:text-[#D4AF37]/85"
                        strokeWidth={2}
                      />
                    </Link>
                    )}

                    {/* Footer mark */}
                    <div className="relative border-t border-white/[0.06] px-6 py-2.5 text-center">
                      <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.32em] text-white/30">
                        Kerala Ayurvedic Lifestyle
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile: hamburger ── */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart" aria-label="Cart" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A0C18]/10 text-[#4A0C18] hover:bg-[#4A0C18]/20">
              <ShoppingCart className="h-4.5 w-4.5" />
            </Link>
            <button
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A0C18] text-white"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="bg-[#4A0C18] md:hidden">
          <ul className="flex flex-col px-4 py-3">

            <li className="border-b border-white/8">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37]">
                Home
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37]">
                About Us
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/treatments" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37]">
                Treatments
              </Link>
            </li>

            {/* Products accordion */}
            <li className="border-b border-white/8">
              <button
                onClick={() => setMobileProducts((p) => !p)}
                className="flex w-full items-center justify-between py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37] focus:outline-none"
              >
                Products
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileProducts ? 'rotate-180 text-[#D4AF37]' : ''}`} />
              </button>
              {mobileProducts && (
                <ul className="mb-3 space-y-1 border-l-2 border-[#D4AF37]/30 pl-4">
                  {productsDropdown.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { setMobileOpen(false); setMobileProducts(false) }}
                        className="flex items-center gap-2 py-2 font-heading text-sm text-white/55 transition-colors hover:text-[#D4AF37]"
                      >
                        <span className="h-1 w-1 rounded-full bg-[#D4AF37]/50" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className="border-b border-white/8">
              <Link href="/blog" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37]">
                Blog
              </Link>
            </li>
            <li className="border-b border-white/8">
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-white/75 transition-colors hover:text-[#D4AF37]">
                Contact
              </Link>
            </li>

            {/* CTA stack */}
            <li className="mt-4 space-y-2 pb-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
              >
                <User className="h-4 w-4" />
                Wellness Member
              </Link>
              <Link
                href="/partners"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
              >
                <Sparkles className="h-4 w-4" />
                Brand Partner
              </Link>
              <Link
                href="/book"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-full bg-[#D4AF37] py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-[#1F1F1F] transition-all hover:bg-[#D4AF37]"
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
