'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { ProfileEditorWrapper } from '@/src/libraries/core/components/ProfileEditor.webflow';

function ProfileEditorContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <ProfileEditorWrapper />
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileEditorContent />
    </ProtectedRoute>
  );
}
