import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | OpenCrow",
    default: "OpenCrow - Embed Authentic AI Agents in Minutes",
  },
  description:
    "Open-source AI agent platform to build, deploy, and monitor intelligent assistants. Connect APIs and control your frontend to help users.",
  keywords: [
    "AI Agent",
    "Open Source",
    "LLM Integration",
    "React Widget",
    "Next.js",
    "AI Assistant",
    "Frontend Automation",
  ],
  authors: [{ name: "Himanshu", url: "https://github.com/himasnhu-at" }],
  creator: "Himanshu",
  publisher: "OpenCrow",
  openGraph: {
    title: "OpenCrow - Embed Authentic AI Agents in Minutes",
    description:
      "Build, deploy, and monitor AI agents that understand your product. Connect to your APIs and control your frontend effortlessly.",
    url: "https://opencrow.himanshuat.com",
    siteName: "OpenCrow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/demo-screenshot.png",
        width: 1200,
        height: 630,
        alt: "OpenCrow Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCrow - Embed Authentic AI Agents in Minutes",
    description:
      "Open-source AI agent platform to build, deploy, and monitor intelligent assistants.",
    creator: "@himanshu806",
    images: ["/demo-screenshot.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://opencrow.himanshuat.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}
