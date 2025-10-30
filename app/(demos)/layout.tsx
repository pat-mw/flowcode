'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { useAuthRevalidation } from '@/hooks/useAuthRevalidation';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { Toaster } from 'sonner';
import "@/lib/styles/globals.css";

const geistSans = Geist({
  variable: "--_font---sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--_font---mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  // Revalidate auth session on app load
  useAuthRevalidation();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BlogFlow - Modern Blogging Platform</title>
        <meta name="description" content="A modern blogging platform built with Next.js and Webflow" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
