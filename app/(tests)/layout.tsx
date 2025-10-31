'use client';

export default function TestsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased">
          {children}
      </body>
    </html>
  );
}
