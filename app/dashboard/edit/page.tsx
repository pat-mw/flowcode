'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PostEditorContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('post');
  const isEditing = !!postId;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEditing
                ? `Editing post ID: ${postId}`
                : 'Write and publish your blog post'
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PostEditor Component</CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Edit your existing post with rich text editor'
                  : 'Create a new post with rich text editor'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground mb-4">
                  PostEditor component will be implemented here
                </p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Features:</p>
                  <ul className="list-disc list-inside">
                    <li>Rich text editor for post content</li>
                    <li>Title and excerpt fields</li>
                    <li>Save as draft or publish</li>
                    <li>Image upload for featured image</li>
                    <li>Tags and categories</li>
                    <li>Preview mode</li>
                    <li>Auto-save functionality</li>
                  </ul>
                </div>
              </div>

              {isEditing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Note: This page handles both creating new posts and editing existing posts.
                    The post ID is passed via query parameter: <code className="font-mono">?post={postId}</code>
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button disabled>
                  Save Draft (Coming Soon)
                </Button>
                <Button disabled variant="outline">
                  Publish (Coming Soon)
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/posts">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PostEditorPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      }>
        <PostEditorContent />
      </Suspense>
    </ProtectedRoute>
  );
}

export default PostEditorPage;
