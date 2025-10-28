'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';

export interface NavigationLink {
  label: string;
  href: string;
  authRequired?: boolean;
}

export interface NavigationProps {
  brandName?: string;
  brandLogo?: string;
  homeUrl?: string;
  showAuthButtons?: boolean;
  loginUrl?: string;
  registerUrl?: string;
  customLinks?: NavigationLink[];
  variant?: 'default' | 'minimal' | 'centered';
}

export default function Navigation({
  brandName = 'BlogFlow',
  brandLogo,
  homeUrl = '/',
  showAuthButtons = true,
  loginUrl = '/login',
  registerUrl = '/register',
  customLinks = [
    { label: 'Blog', href: '/blog', authRequired: false },
    { label: 'Dashboard', href: '/dashboard', authRequired: true },
    { label: 'Posts', href: '/dashboard/posts', authRequired: true },
    { label: 'Profile', href: '/profile', authRequired: true },
  ],
  variant = 'default',
}: NavigationProps) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = homeUrl;
  };

  // Filter links based on auth requirement
  const visibleLinks = customLinks.filter(
    (link) => !link.authRequired || (link.authRequired && isAuthenticated)
  );

  const navClasses =
    variant === 'centered'
      ? 'border-b bg-background'
      : variant === 'minimal'
        ? 'bg-background'
        : 'border-b bg-background';

  const containerClasses =
    variant === 'centered'
      ? 'container mx-auto px-4 flex flex-col items-center gap-4 py-4'
      : 'container mx-auto px-4';

  const innerClasses =
    variant === 'centered'
      ? 'flex flex-col items-center gap-4 w-full'
      : 'flex h-16 items-center justify-between';

  return (
    <nav className={navClasses}>
      <div className={containerClasses}>
        <div className={innerClasses}>
          {/* Brand Section */}
          <div className="flex items-center gap-8">
            <a href={homeUrl} className="flex items-center gap-2">
              {brandLogo && (
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="h-8 w-8 object-contain"
                />
              )}
              {
                brandName && (
                  <span className="text-xl font-bold">{brandName}</span>
                )
              }
            </a>

            {/* Navigation Links */}
            {variant !== 'minimal' && (
              <div className="hidden md:flex items-center gap-6">
                {visibleLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Auth Section */}
          {showAuthButtons && (
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = loginUrl)}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = registerUrl)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Links - Show below on small screens for centered variant */}
        {variant === 'centered' && visibleLinks.length > 0 && (
          <div className="flex md:hidden flex-wrap items-center justify-center gap-4">
            {visibleLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
