import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/react';
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NTUC Workflow",
  description: "Enhance your jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-100" data-theme="light">
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/NTUC-Fairprice-Logo.png" />
        <title>NTUC Workflow</title>
        <meta name="description" content="Enhance your jobs" />
      </head>
      <body className={`${inter.className} text-base-content bg-base-100`}>
        <Navbar />
        <main>{children}</main> {/* Main content */}
        <Footer /> {/* Add the footer at the bottom */}
        <Analytics />
      </body>
    </html>
  );
}
