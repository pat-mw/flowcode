'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonUrl?: string;
  showFeatures?: boolean;
  showBlogCTA?: boolean;
}

export default function HeroSection({
  title = 'Welcome to BlogFlow',
  subtitle = 'A modern blogging platform built with Next.js and Webflow',
  primaryButtonText,
  secondaryButtonText,
  primaryButtonUrl,
  secondaryButtonUrl,
  showFeatures = true,
  showBlogCTA = true,
}: HeroSectionProps) {
  const { isAuthenticated } = useAuthStore();

  // Determine button text and URLs based on auth state if not provided
  const finalPrimaryText = primaryButtonText || (isAuthenticated ? 'Go to Dashboard' : 'Get Started');
  const finalSecondaryText = secondaryButtonText || (isAuthenticated ? 'View Blog' : 'Login');
  const finalPrimaryUrl = primaryButtonUrl || (isAuthenticated ? '/dashboard' : '/register');
  const finalSecondaryUrl = secondaryButtonUrl || (isAuthenticated ? '/blog' : '/login');

  return (
    <main className="flex-1 container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Title & Subtitle */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <a href={finalPrimaryUrl}>{finalPrimaryText}</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={finalSecondaryUrl}>{finalSecondaryText}</a>
          </Button>
        </div>

        {/* Feature Cards */}
        {showFeatures && (
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle>Write Posts</CardTitle>
                <CardDescription>
                  Create and publish blog posts with a rich text editor
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Content</CardTitle>
                <CardDescription>
                  Organize your posts with drafts and published states
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Profile</CardTitle>
                <CardDescription>
                  Build your author profile with bio and social links
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Blog CTA */}
        {showBlogCTA && (
          <div className="mt-16 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Browse Public Blog</h2>
            <p className="text-muted-foreground mb-4">
              Check out posts from our community of writers
            </p>
            <Button variant="outline" asChild>
              <a href="/blog">View All Posts</a>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
