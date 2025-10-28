'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              BlogFlow
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/posts"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Posts
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
