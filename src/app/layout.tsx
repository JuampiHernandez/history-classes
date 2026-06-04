import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Academy — Voice-first exam prep with legendary tutors",
  description:
    "Tomorrow's exam. Legendary minds. Live lip-synced avatars, a real-time whiteboard, and one-to-one voice tutoring that adapts to you.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Academy",
    title: "The Academy — Voice-first exam prep with legendary tutors",
    description:
      "Live tutoring, lip-sync avatars, and whiteboard help from legendary tutors.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1024,
        height: 537,
        alt: "The Academy — voice-first exam prep with legendary tutors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Academy — Voice-first exam prep with legendary tutors",
    description:
      "Live tutoring, lip-sync avatars, and whiteboard help from legendary tutors.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/icon.jpg", type: "image/jpeg" }],
    apple: [{ url: "/icon.jpg", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
