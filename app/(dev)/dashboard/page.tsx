'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function DashboardContent() {
  const { user, person } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {person?.displayName || user?.name}!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Posts</CardTitle>
                <CardDescription>Your published posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Coming soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Draft Posts</CardTitle>
                <CardDescription>Posts in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Coming soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Views</CardTitle>
                <CardDescription>Across all posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Coming soon
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Component</CardTitle>
              <CardDescription>
                Quick access to your content and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground mb-4">
                  Dashboard component will be implemented here
                </p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Features:</p>
                  <ul className="list-disc list-inside">
                    <li>Recent posts overview</li>
                    <li>Quick stats and analytics</li>
                    <li>Quick actions (create post, edit profile)</li>
                    <li>Recent activity feed</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/dashboard/edit">Create New Post</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/posts">View All Posts</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
