'use client';
// import "./globals.css";
import { WebflowProvidersWrapper } from "@/lib/webflow/providers";
import { Geist, Geist_Mono } from "next/font/google";

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
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="dark antialiased">
        <WebflowProvidersWrapper>
          {children}
        </WebflowProvidersWrapper>
      </body>
    </html>
  );
}
