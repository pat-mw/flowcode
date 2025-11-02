'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Database, Rocket, ArrowRight } from 'lucide-react';

export default function VercelSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Successfully Connected!</h1>
          <p className="text-xl text-muted-foreground">
            Your Vercel account is now integrated with Blogflow
          </p>
        </div>

        {/* What's Next Section */}
        <Card>
          <CardHeader>
            <CardTitle>What would you like to do next?</CardTitle>
            <CardDescription>
              Choose from the options below to get started with your Vercel integration
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Database Card */}
            <button
              onClick={() => router.push('/integrations/test#databases')}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold">Create a Database</h3>
                <p className="text-sm text-muted-foreground">
                  Provision a Postgres database on Vercel with just a few clicks
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  Get started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Deployment Card */}
            <button
              onClick={() => router.push('/integrations/test#deployments')}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold">Create a Deployment</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy a test site or application to Vercel in seconds
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  Deploy now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Integration Details */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">Vercel</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-2 font-medium text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Permissions</span>
              <span className="font-medium">Database & Deployment Management</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/integrations/test')}
            size="lg"
            className="gap-2"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
