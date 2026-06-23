import type { Metadata } from "next";
import { Montserrat, Lora, Playfair_Display, Tiro_Devanagari_Sanskrit, IM_Fell_English } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart/CartProvider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const devanagari = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  variable: "--font-devanagari",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const fell = IM_Fell_English({
  subsets: ["latin"],
  variable: "--font-fell",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  // This decorative font has no Next.js fallback-metric data; disabling the
  // automatic adjustment silences the "Failed to find font override" warning.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://keralaayurvediclifestyle.com.my"),
  title: {
    default:
      "Kerala Ayurvedic Lifestyle | Authentic Ayurveda in Brickfields, KL",
    template: "%s | Kerala Ayurvedic Lifestyle",
  },
  description:
    "Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur has been offering authentic Kerala Ayurveda therapies since 2008. Book a consultation with our Vaidyas, shop pure herbal formulas and discover Panchakarma, Abhyanga and Shirodhara treatments.",
  keywords: [
    "Ayurveda",
    "Kerala Ayurveda",
    "Brickfields",
    "Kuala Lumpur",
    "Panchakarma",
    "Abhyanga KL",
    "Shirodhara KL",
    "Holistic Healing Malaysia",
    "Ayurvedic products Malaysia",
    "Kerala herbal oils",
    "Vaidya consultation Malaysia",
  ],
  authors: [{ name: "Kerala Ayurvedic Lifestyle" }],
  creator: "Kerala Ayurvedic Lifestyle Sdn Bhd",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: "https://keralaayurvediclifestyle.com.my",
    siteName: "Kerala Ayurvedic Lifestyle",
    title:
      "Kerala Ayurvedic Lifestyle | Authentic Ayurveda in Brickfields, KL",
    description:
      "Authentic Kerala Ayurveda since 2008. Therapies, herbal products and consultations with our Vaidyas in the heart of Kuala Lumpur.",
    images: [
      {
        url: "/hero-tray.png",
        width: 1200,
        height: 630,
        alt: "Kerala Ayurvedic Lifestyle — authentic herbs and therapies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Ayurvedic Lifestyle | Brickfields, KL",
    description:
      "Authentic Kerala Ayurveda since 2008. Book a consultation with our Vaidyas.",
    images: ["/hero-tray.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable} ${playfair.variable} ${devanagari.variable} ${fell.variable}`}>
      <body className="antialiased font-body bg-background text-foreground">
        <CartProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid rgba(22, 63, 51,0.10)',
                color: '#163F33',
                fontFamily: 'var(--font-lora)',
                fontSize: '13px',
                boxShadow:
                  '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
