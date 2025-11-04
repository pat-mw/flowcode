'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import PostsList from '@/components/PostsList';

function PostsListContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <PostsList />
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
