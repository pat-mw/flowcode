'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { PostsListWrapper } from '@/src/libraries/core/components/PostsList.webflow';

function PostsListContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <PostsListWrapper />
      </main>
    </div>
  );
}

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsListContent />
    </ProtectedRoute>
  );
}
