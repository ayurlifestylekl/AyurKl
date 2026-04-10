# Frontend Context & Copy: Kerala Ayurvedic Lifestyle
**Project:** Next.js 14 E-commerce & Booking Platform

## 1. Business Profile & Legal Details (For Footer & About Page)
* **Trading/Brand Name:** Kerala Ayurvedic Lifestyle Sdn Bhd
* **Registered Business Name:** Ayurvedic Lifestyle (KL) Sdn Bhd
* **Business Registration No:** 847466D
* **Country Of Registration:** MALAYSIA
* **Business Description (For Hero/About sections):** "Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur has been offering authentic Kerala Ayurveda therapies since 2008, delivered by experienced practitioners and skilled therapists from Kerala. We provide personalized treatments for stress relief, joint care, detox, women's wellness, and holistic healing using traditional methods and natural herbal therapies."

## 2. Contact & Social Links (For Navbar, Footer & WhatsApp Widget)
* **WhatsApp Business Number:** +601165043436 (Use this for the floating action button)
* **Facebook:** https://www.facebook.com/KeralaAyurvedicLifestyle
* **Instagram:** https://www.instagram.com/keralaayurvedic/?hl=en
* **TikTok:** https://www.tiktok.com/@keralaayurvediclifestyle

# Design System & UI Guidelines: Ayurvedic Digital Ecosystem
**Stack:** Next.js 14, Tailwind CSS, Shadcn UI (or standard Tailwind components)
[cite_start]**Design Style / Mood:** Traditional & Luxury Wellness [cite: 151]

## 1. Brand Color Palette (Tailwind Configuration)
Please use these exact HEX codes to extend the Tailwind theme. [cite_start]Do not use default Tailwind colors for these primary UI elements [cite: 143-146].

* [cite_start]**Primary:** Deep Herbal Green `"#2F5D50"` [cite: 143]
  * *Usage:* Primary buttons, Navbar backgrounds, active states, key highlighted text.
* [cite_start]**Secondary:** Muted Olive Green `"#7A9D54"` [cite: 144]
  * *Usage:* Secondary buttons, badges, subtle backgrounds, hover states for primary items.
* [cite_start]**Accent:** Turmeric Gold `"#D4A373"` [cite: 145]
  * *Usage:* "Book Now" buttons, sale tags, warning states, review stars, interactive hover effects.
* [cite_start]**Text / Dark:** Charcoal Dark `"#2B2B2B"` [cite: 146]
  * *Usage:* Primary body text, headings, footer background.
* **Background / Light (Implied):** Crisp White `"#FFFFFF"` or Off-White `"#F9F9F9"`
  * *Usage:* Main application background, card backgrounds.

## 2. Typography
We are using Google Fonts. [cite_start]Please ensure these are imported efficiently using `next/font/google` in the root layout[cite: 149, 150].

* [cite_start]**Headings (h1, h2, h3, h4):** `Montserrat` [cite: 149]
  * *Usage:* Use for all section titles, product titles, and hero text. Keep font weights bold (600-800) for luxury feel.
* [cite_start]**Body Text (p, span, li):** `Lora` (Serif) [cite: 150]
  * *Usage:* Use for product descriptions, blog content, and general UI text. This serif font establishes the "Traditional" Ayurvedic aesthetic.

## 3. General UI/UX Directives for AI Assistant
When generating Next.js frontend components, adhere to the following rules:
1. **Mobile-First:** Ensure all components (especially the Navbar, Product Grid, and Booking Form) are fully responsive and optimized for mobile devices.
2. **Spacing:** Use generous padding and margins (e.g., `py-16`, `gap-8`) to give the design a breathable, premium feel. 
3. **Buttons:** Primary buttons should use the Deep Herbal Green (`bg-[#2F5D50]`) with a slight hover effect. Call-to-action buttons (like "Book Consultation") should use the Turmeric Gold (`bg-[#D4A373]`).
4. **Icons:** Use Lucide React icons for UI elements (e.g., shopping cart, user profile, menu burger).