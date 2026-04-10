import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://keralaayurvedic.com"),
  title: {
    default:
      "Kerala Ayurvedic Lifestyle | Authentic Ayurveda in Brickfields, KL",
    template: "%s | Kerala Ayurvedic Lifestyle",
  },
  description:
    "Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur has been offering authentic Kerala Ayurveda therapies since 2008. Book a consultation with Vaidya AKHIL HS (B.A.M.S), shop pure herbal formulas and discover Panchakarma, Abhyanga and Shirodhara treatments.",
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
    url: "https://keralaayurvedic.com",
    siteName: "Kerala Ayurvedic Lifestyle",
    title:
      "Kerala Ayurvedic Lifestyle | Authentic Ayurveda in Brickfields, KL",
    description:
      "Authentic Kerala Ayurveda since 2008. Therapies, herbal products and consultations with Vaidya AKHIL HS (B.A.M.S) in the heart of Kuala Lumpur.",
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
      "Authentic Kerala Ayurveda since 2008. Book a consultation with Vaidya AKHIL HS (B.A.M.S).",
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
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`}>
      <body className="antialiased font-body bg-background text-foreground">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
