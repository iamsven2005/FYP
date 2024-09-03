import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bihance",
  description: "Enhance your jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className="min-h-100">
        <head>
          <meta name="robots" content="index, follow" />
          <link rel="icon" href="/favicon.ico" />
          <title>NTUC Workflow</title>
          <meta name="description" content="Enhance your jobs" />
        </head>
        <body className={inter.className}>
        {children}
        </body>
      </html>
  );
}
