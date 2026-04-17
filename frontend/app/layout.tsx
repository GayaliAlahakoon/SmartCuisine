import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🥗 SmartCuisine - AI-Powered Recipe & Allergen Assistant",
  description: "AI-Powered Recipe & Allergen Assistant System Created by Gayali Alahakoon",
  icons: {
    icon: "/favicon.ico", 
  },
  metadataBase: new URL("https://smartcuisine.ai"),
  themeColor: "#111827",
  authors: [{ name: "Gayali Alahakoon" }],
  openGraph: {
    title: "🥗 SmartCuisine - AI-Powered Recipe & Allergen Assistant",
    description: "AI-driven recipe recommendations and allergen detection for healthier cooking.",
    siteName: "SmartCuisine",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartCuisine Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${_geist.className} ${_geistMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
