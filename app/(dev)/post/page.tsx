'use client';

import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import PostView from '@/components/PostView';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function PostViewContent() {
  const postId = useQueryParam('id');

  const handleBackToBlog = () => {
    window.location.href = '/blog';
  };

  // If no post ID provided, show error
  if (!postId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>No Post Selected</CardTitle>
            <CardDescription>
              Please select a post to view from the blog page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToBlog}>
              Go to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PostView postId={postId} />;
}

// Suspense wrapper for useSearchParams
function PostViewWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      }
    >
      <PostViewContent />
    </Suspense>
  );
}

export default function PostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <PostViewWithSuspense />
      </main>
    </div>
  );
}
