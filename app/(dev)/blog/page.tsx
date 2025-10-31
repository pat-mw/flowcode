'use client';

import Navigation from '@/components/Navigation';
import { PublicPostsListWrapper } from '@/src/libraries/core/components/PublicPostsList.webflow';

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <PublicPostsListWrapper initialLimit={10} enableSearch={true} />
      </main>
    </div>
  );
}
