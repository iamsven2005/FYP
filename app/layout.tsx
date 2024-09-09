import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <html lang="en" className="min-h-screen flex flex-col" data-theme="dark">
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/NTUC-Fairprice-Logo.png" />
        <title>NTUC Workflow</title>
        <meta name="description" content="Enhance your jobs" />
      </head>
      <body className={`${inter.className} text-base-content bg-base-100 flex flex-col min-h-screen`}>
        <Navbar />
        <ToastContainer /> {/* Include ToastContainer to enable toasts globally */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
