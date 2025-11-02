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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
  Database as DatabaseIcon,
  Rocket,
} from 'lucide-react';

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
  status: string;
  createdAt: string;
};

type Deployment = {
  id: string;
  name: string;
  url: string;
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
  inspectorUrl?: string;
};

const VERCEL_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'eu-west-1', label: 'EU West (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
] as const;

const DEPLOYMENT_TEMPLATES = [
  { value: 'static', label: 'Static HTML (Instant)' },
  { value: 'nextjs-hello-world', label: 'Next.js Hello World' },
] as const;

export default function IntegrationsTestPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  // Database state
  const [dbName, setDbName] = useState('');
  const [dbRegion, setDbRegion] = useState<string>('us-east-1');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState<Database | null>(null);

  // Deployment state
  const [deploymentName, setDeploymentName] = useState('');
  const [deploymentTemplate, setDeploymentTemplate] = useState<string>('static');
  const [createdDeployment, setCreatedDeployment] = useState<Deployment | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch integrations
  const { data: integrations = [], isLoading: loading } = useQuery(
    orpc.integrations.listIntegrations.queryOptions()
  );

  const vercelIntegrations = integrations.filter((i) => i.provider === 'vercel');
  console.log('[DEBUG] All Vercel integrations:', vercelIntegrations);

  const vercelIntegration = vercelIntegrations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  console.log('[DEBUG] Selected integration:', vercelIntegration);

  // Fetch databases list
  const {
    data: databases = [],
    isLoading: loadingDatabases,
    refetch: refetchDatabases,
  } = useQuery({
    ...orpc.integrations.listVercelDatabases.queryOptions({
      input: {
        integrationId: vercelIntegration?.id || '',
      },
    }),
    enabled: !!vercelIntegration,
  });

  // Fetch deployments list
  const {
    data: deploymentsData,
    isLoading: loadingDeployments,
    refetch: refetchDeployments,
  } = useQuery({
    ...orpc.integrations.listVercelDeployments.queryOptions({
      input: {
        integrationId: vercelIntegration?.id || '',
      },
    }),
    enabled: !!vercelIntegration,
  });

  const deployments = deploymentsData?.deployments || [];

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (success === 'true') {
      setMessage({ type: 'success', text: 'Vercel account connected successfully!' });
      queryClient.invalidateQueries({ queryKey: orpc.integrations.key() });
    } else if (error) {
      setMessage({ type: 'error', text: errorDescription || 'OAuth failed' });
    }
  }, [searchParams, queryClient]);

  // Poll deployment status if we have a building deployment
  useEffect(() => {
    if (!vercelIntegration || !createdDeployment) return;
    if (createdDeployment.readyState === 'READY' || createdDeployment.readyState === 'ERROR' || createdDeployment.readyState === 'CANCELED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await queryClient.fetchQuery(
          orpc.integrations.getVercelDeploymentStatus.queryOptions({
            input: {
              integrationId: vercelIntegration.id,
              deploymentId: createdDeployment.id,
            },
          })
        );
        setCreatedDeployment(updated);

        if (updated.readyState === 'READY') {
          setMessage({ type: 'success', text: 'Deployment is now live!' });
          refetchDeployments();
        } else if (updated.readyState === 'ERROR') {
          setMessage({ type: 'error', text: 'Deployment failed' });
        }
      } catch (err) {
        console.error('Failed to poll deployment status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [vercelIntegration, createdDeployment, queryClient, refetchDeployments]);

  const handleConnectVercel = async () => {
    try {
      setConnecting(true);
      setMessage(null);

      const response = await fetch('/api/integrations/vercel/auth-url');
      if (!response.ok) {
        throw new Error('Failed to generate OAuth URL');
      }

      const { url, state } = await response.json();
      document.cookie = `vercel_oauth_state=${state}; path=/; max-age=600; samesite=lax`;
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
        setDbName('');
        refetchDatabases();
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
    createDatabaseMutation.mutate({
      integrationId: vercelIntegration.id,
      name: dbName.trim(),
      region: dbRegion as any,
    });
  };

  // Delete database mutation
  const deleteDatabaseMutation = useMutation(
    orpc.integrations.deleteVercelDatabase.mutationOptions({
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Database deleted successfully' });
        refetchDatabases();
        setDeleteDialogOpen(false);
        setDatabaseToDelete(null);
      },
      onError: (err: Error) => {
        console.error('Failed to delete database:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to delete database' });
        setDeleteDialogOpen(false);
      },
    })
  );

  const handleDeleteDatabase = (database: Database) => {
    setDatabaseToDelete(database);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDatabase = () => {
    if (!vercelIntegration || !databaseToDelete) return;

    deleteDatabaseMutation.mutate({
      integrationId: vercelIntegration.id,
      databaseId: databaseToDelete.id,
    });
  };

  // Create deployment mutation
  const createDeploymentMutation = useMutation(
    orpc.integrations.createVercelDeployment.mutationOptions({
      onSuccess: (result) => {
        setMessage({ type: 'success', text: `Deployment "${result.name}" created successfully!` });
        setCreatedDeployment(result);
        setDeploymentName('');
        refetchDeployments();
      },
      onError: (err: Error) => {
        console.error('Failed to create deployment:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to create deployment' });
      },
    })
  );

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vercelIntegration) {
      setMessage({ type: 'error', text: 'No Vercel integration found' });
      return;
    }

    if (!deploymentName.trim()) {
      setMessage({ type: 'error', text: 'Deployment name is required' });
      return;
    }

    setMessage(null);
    setCreatedDeployment(null);

    createDeploymentMutation.mutate({
      integrationId: vercelIntegration.id,
      name: deploymentName.trim(),
      template: deploymentTemplate as any,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      QUEUED: 'secondary',
      BUILDING: 'default',
      READY: 'default',
      ERROR: 'destructive',
      CANCELED: 'outline',
      active: 'default',
      creating: 'secondary',
      error: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.toLowerCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Vercel Integration Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the Vercel OAuth flow, database provisioning, and deployments
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Connected to Vercel</p>
                  <p className="text-sm text-muted-foreground">
                    Connected on {new Date(vercelIntegration.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button onClick={handleConnectVercel} disabled={connecting} variant="outline">
                {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reconnect to Vercel
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnectVercel} disabled={connecting}>
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Vercel Account
            </Button>
          )}
        </CardContent>
      </Card>

      {vercelIntegration && (
        <>
          {/* Databases Section */}
          <div id="databases" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <DatabaseIcon className="h-6 w-6" />
                  Databases
                </h2>
                <p className="text-muted-foreground text-sm">
                  Manage your Vercel Postgres databases
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchDatabases()}
                disabled={loadingDatabases}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingDatabases ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Database List */}
            {databases.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Databases</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {databases.map((db) => (
                        <TableRow key={db.id}>
                          <TableCell className="font-medium">{db.name}</TableCell>
                          <TableCell>{db.region}</TableCell>
                          <TableCell>{getStatusBadge(db.status)}</TableCell>
                          <TableCell>
                            {new Date(db.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDatabase(db)}
                              disabled={deleteDatabaseMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              !loadingDatabases && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No databases yet. Create one below to get started.
                  </CardContent>
                </Card>
              )
            )}

            {/* Create Database Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Database</CardTitle>
                <CardDescription>
                  Provision a new Postgres database on Vercel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDatabase} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="db-name">Database Name</Label>
                      <Input
                        id="db-name"
                        placeholder="my-database"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        disabled={createDatabaseMutation.isPending}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="db-region">Region</Label>
                      <Select
                        value={dbRegion}
                        onValueChange={setDbRegion}
                        disabled={createDatabaseMutation.isPending}
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
                  </div>

                  <Button type="submit" disabled={createDatabaseMutation.isPending}>
                    {createDatabaseMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Database
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Deployments Section */}
          <div id="deployments" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Deployments
              </h2>
              <p className="text-muted-foreground text-sm">
                Deploy test sites and applications to Vercel
              </p>
            </div>

            {/* Active Deployment Status */}
            {createdDeployment && (
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Deployment Name</p>
                      <p className="text-sm text-muted-foreground">{createdDeployment.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <div className="mt-1">{getStatusBadge(createdDeployment.readyState)}</div>
                    </div>
                    {createdDeployment.readyState === 'READY' && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Deployment URL</p>
                          <a
                            href={`https://${createdDeployment.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {createdDeployment.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {createdDeployment.inspectorUrl && (
                          <div>
                            <p className="text-sm font-medium">Vercel Dashboard</p>
                            <a
                              href={createdDeployment.inspectorUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              View in Vercel
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {createdDeployment.readyState === 'BUILDING' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building deployment... This may take a few minutes.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Deployment List */}
            {deployments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deployments.slice(0, 5).map((deployment) => (
                        <TableRow key={deployment.id}>
                          <TableCell className="font-medium">{deployment.name}</TableCell>
                          <TableCell>
                            {deployment.readyState === 'READY' ? (
                              <a
                                href={`https://${deployment.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                {deployment.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">{deployment.url}</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(deployment.readyState)}</TableCell>
                          <TableCell>
                            {new Date(deployment.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Create Deployment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Deployment</CardTitle>
                <CardDescription>
                  Deploy a test site to Vercel in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDeployment} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deployment-name">Deployment Name</Label>
                      <Input
                        id="deployment-name"
                        placeholder="my-test-site"
                        value={deploymentName}
                        onChange={(e) => setDeploymentName(e.target.value)}
                        disabled={createDeploymentMutation.isPending}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deployment-template">Template</Label>
                      <Select
                        value={deploymentTemplate}
                        onValueChange={setDeploymentTemplate}
                        disabled={createDeploymentMutation.isPending}
                      >
                        <SelectTrigger id="deployment-template">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPLOYMENT_TEMPLATES.map((template) => (
                            <SelectItem key={template.value} value={template.value}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={createDeploymentMutation.isPending}>
                    {createDeploymentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Deployment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the database &quot;{databaseToDelete?.name}&quot;?
              This action cannot be undone and all data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
