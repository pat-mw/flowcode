'use client';

import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <WebflowProvidersWrapper>{children}</WebflowProvidersWrapper>
      </body>
    </html>
  );
}
