'use client';

import Navigation from '@/components/Navigation';
import PublicPostsList from '@/components/PublicPostsList';

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <PublicPostsList pageSize={9} enableSearch={true} />
      </main>
    </div>
  );
}
