'use client';
// import "./globals.css";
import { WebflowProvidersWrapper } from "@/lib/webflow/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body className="antialiased">
        <WebflowProvidersWrapper>
          {children}
        </WebflowProvidersWrapper>
      </body>
    </html>
  );
}
