import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tuppli - Agentic AI Systems & Agent Reliability Engineering",
  description: "We build agentic AI systems that survive production. Pioneering Agent Reliability Engineering — making autonomous AI agents observable, safe, and accountable.",
};

import { CookieConsent } from "@/components/compliance/cookie-consent";
import { NotificationManager } from "@/components/notifications/notification-manager";
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Tuppli",
              "description": "Agentic AI Systems and Agent Reliability Engineering. We build autonomous AI agents that survive production.",
              "url": "https://tuppli.com",
              "logo": "https://tuppli.com/loggo.png",
              "sameAs": [
                "https://www.linkedin.com/company/tuppli"
              ],
              "serviceType": ["Agentic AI Systems", "Agent Reliability Engineering", "AI Consulting"]
            })
          }}
        />
        <CookieConsent />
        <NotificationManager />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
