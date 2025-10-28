'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome to BlogFlow
            </h1>
            <p className="text-xl text-muted-foreground">
              A modern blogging platform built with Next.js and Webflow
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/blog">View Blog</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>

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

          <div className="mt-16 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Browse Public Blog</h2>
            <p className="text-muted-foreground mb-4">
              Check out posts from our community of writers
            </p>
            <Button variant="outline" asChild>
              <Link href="/blog">View All Posts</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          BlogFlow - Built with Next.js, Webflow, and modern web technologies
        </div>
      </footer>
    </div>
  );
}
