'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Sign in to your BlogFlow account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                LoginForm component will be implemented here
              </p>
              <p className="text-sm text-muted-foreground">
                This will include email/password fields and authentication logic
              </p>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>

            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
