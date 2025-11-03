/**
 * Dashboard Component
 * Displays the currently logged-in user's profile information
 */

'use client';

import * as React from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { signOut } from '@/lib/auth/client';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardProps {
  showLogout?: boolean;
}

export default function Dashboard({ showLogout = true }: DashboardProps) {
  const { user, person, isAuthenticated, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Fetch user's posts to calculate stats - only when authenticated
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    ...orpc.posts.list.queryOptions({
      input: {
        limit: 1000, // Get all posts for stats
        offset: 0,
      },
    }),
    enabled: isAuthenticated && !!user, // Only fetch when authenticated
  });

  // Debug logging
  React.useEffect(() => {
    console.log('[Dashboard] Posts query state:', {
      isAuthenticated,
      hasUser: !!user,
      postsLoading,
      postsError: postsError?.message,
      postsCount: posts?.length,
      posts: posts,
    });
  }, [isAuthenticated, user, postsLoading, postsError, posts]);

  // Calculate stats
  const publishedCount = posts?.filter((p) => p.status === 'published').length || 0;
  const draftCount = posts?.filter((p) => p.status === 'draft').length || 0;
  const totalPosts = posts?.length || 0;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      clearAuth();

      // Redirect to home or login page
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            You need to be logged in to view this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please log in to access your dashboard.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/auth/login">Go to Login</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Get initials for avatar fallback
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            View and manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image || person?.avatar || undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{person?.displayName || user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>

            {person && (
              <>
                {person.bio && (
                  <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Bio:</span>
                    <span>{person.bio}</span>
                  </div>
                )}

                {person.website && (
                  <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Website:</span>
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {person.website}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>

        {showLogout && (
          <CardFooter className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/profile">Edit Profile</a>
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{publishedCount}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{draftCount}</div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard/posts">View All Posts</a>
          </Button>
        </CardFooter>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Create and manage your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button asChild>
              <a href="/dashboard/edit">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Post
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/posts">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Manage Posts
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
