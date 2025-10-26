'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Sign up for a new BlogFlow account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                RegistrationForm component will be implemented here
              </p>
              <p className="text-sm text-muted-foreground">
                This will include name, email, password fields and registration logic
              </p>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
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
