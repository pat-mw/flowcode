'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import PostEditor from '@/components/PostEditor';

function PostEditorPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1 container mx-auto px-4 py-16">
          <PostEditor />
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default PostEditorPage;
