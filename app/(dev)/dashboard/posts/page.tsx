'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PostsListContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Posts</h1>
              <p className="text-lg text-muted-foreground">
                Manage all your blog posts
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/edit">Create New Post</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PostsList Component</CardTitle>
              <CardDescription>
                View and manage your draft and published posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground mb-4">
                  PostsList component will be implemented here
                </p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Features:</p>
                  <ul className="list-disc list-inside">
                    <li>Display all user&apos;s posts (published and drafts)</li>
                    <li>Filter by status (all, published, draft)</li>
                    <li>Search posts by title</li>
                    <li>Edit and delete actions</li>
                    <li>View post statistics</li>
                    <li>Bulk actions</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/dashboard/edit">Create First Post</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
