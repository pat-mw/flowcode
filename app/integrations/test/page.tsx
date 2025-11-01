'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Integration = {
  id: string;
  provider: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

type Database = {
  id: string;
  name: string;
  region: string;
  createdAt: string;
};

const VERCEL_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'eu-west-1', label: 'EU West (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
] as const;

export default function IntegrationsTestPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [dbName, setDbName] = useState('');
  const [dbRegion, setDbRegion] = useState<string>('us-east-1');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdDatabase, setCreatedDatabase] = useState<Database | null>(null);

  // Fetch integrations using React Query
  const { data: integrations = [], isLoading: loading } = useQuery(
    orpc.integrations.listIntegrations.queryOptions()
  );

  const vercelIntegration = integrations.find((i) => i.provider === 'vercel');

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (success === 'true') {
      setMessage({ type: 'success', text: 'Vercel account connected successfully!' });
      // Refresh integrations list
      queryClient.invalidateQueries({ queryKey: orpc.integrations.key() });
    } else if (error) {
      setMessage({ type: 'error', text: errorDescription || 'OAuth failed' });
    }
  }, [searchParams, queryClient]);

  const handleConnectVercel = async () => {
    try {
      setConnecting(true);
      setMessage(null);

      // Fetch OAuth URL from API route
      const response = await fetch('/api/integrations/vercel/auth-url');
      if (!response.ok) {
        throw new Error('Failed to generate OAuth URL');
      }

      const { url, state } = await response.json();

      // Store state in cookie for CSRF validation
      document.cookie = `vercel_oauth_state=${state}; path=/; max-age=600; samesite=lax`;

      // Redirect to Vercel OAuth
      window.location.href = url;
    } catch (err) {
      console.error('Failed to initiate OAuth:', err);
      setMessage({ type: 'error', text: 'Failed to initiate OAuth flow' });
      setConnecting(false);
    }
  };

  // Create database mutation
  const createDatabaseMutation = useMutation(
    orpc.integrations.createVercelDatabase.mutationOptions({
      onSuccess: (result) => {
        setMessage({ type: 'success', text: `Database "${result.name}" created successfully!` });
        setCreatedDatabase(result);
        setDbName('');
      },
      onError: (err: Error) => {
        console.error('Failed to create database:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to create database' });
      },
    })
  );

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vercelIntegration) {
      setMessage({ type: 'error', text: 'No Vercel integration found' });
      return;
    }

    if (!dbName.trim()) {
      setMessage({ type: 'error', text: 'Database name is required' });
      return;
    }

    setMessage(null);
    setCreatedDatabase(null);

    createDatabaseMutation.mutate({
      integrationId: vercelIntegration.id,
      name: dbName.trim(),
      region: dbRegion as any,
    });
  };

  const creatingDb = createDatabaseMutation.isPending;

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Vercel Integration Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the Vercel OAuth flow and database provisioning
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            {vercelIntegration
              ? 'Your Vercel account is connected'
              : 'Connect your Vercel account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vercelIntegration ? (
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Connected to Vercel</p>
                <p className="text-sm text-muted-foreground">
                  Connected on {new Date(vercelIntegration.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <Button onClick={handleConnectVercel} disabled={connecting}>
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Vercel Account
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Database Creation Form */}
      {vercelIntegration && (
        <Card>
          <CardHeader>
            <CardTitle>Create Database</CardTitle>
            <CardDescription>
              Provision a new Postgres database on Vercel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDatabase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input
                  id="db-name"
                  placeholder="my-database"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  disabled={creatingDb}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-region">Region</Label>
                <Select
                  value={dbRegion}
                  onValueChange={setDbRegion}
                  disabled={creatingDb}
                >
                  <SelectTrigger id="db-region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERCEL_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={creatingDb}>
                {creatingDb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Database
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Created Database Info */}
      {createdDatabase && (
        <Card>
          <CardHeader>
            <CardTitle>Database Created</CardTitle>
            <CardDescription>Your new Postgres database is ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Database ID</p>
              <p className="text-sm text-muted-foreground font-mono">{createdDatabase.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{createdDatabase.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Region</p>
              <p className="text-sm text-muted-foreground">{createdDatabase.region}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created At</p>
              <p className="text-sm text-muted-foreground">
                {new Date(createdDatabase.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
