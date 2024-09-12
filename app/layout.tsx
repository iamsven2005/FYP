import { ThemeProvider } from 'next-themes'; // Ensure this is from 'next-themes'
import { Toaster } from 'sonner';
import Navbar from '@/components/ui/Navbar';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NTUC Workflow',
  description: 'Enhance your jobs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/NTUC-Fairprice-Logo.png" />
        <title>NTUC Workflow</title>
        <meta name="description" content="Enhance your jobs" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
