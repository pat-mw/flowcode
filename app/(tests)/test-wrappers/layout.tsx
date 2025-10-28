'use client';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased dark">
          {children}
      </body>
    </html>
  );
}
