/**
 * Webflow Integration Page
 * Manage Webflow workspace token and export components
 */

'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function WebflowIntegrationPage() {
  const queryClient = useQueryClient();

  // Token management state
  const [token, setToken] = React.useState('');
  const [tokenSaved, setTokenSaved] = React.useState(false);
  const [savingToken, setSavingToken] = React.useState(false);
  const [tokenError, setTokenError] = React.useState<string | null>(null);

  // Export state
  const [exporting, setExporting] = React.useState(false);
  const [exportLogs, setExportLogs] = React.useState<string[]>([]);
  const [exportResult, setExportResult] = React.useState<{
    success?: boolean;
    error?: string;
    deploymentUrl?: string;
  } | null>(null);

  // Query for token status
  const { data: tokenStatus, isLoading: checkingToken } = useQuery(
    orpc.webflow.getWebflowToken.queryOptions()
  );

  // Mutations
  const saveTokenMutation = useMutation({
    mutationFn: (input: { token: string }) =>
      queryClient.fetchQuery(orpc.webflow.saveWebflowToken.queryOptions({ input })),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      queryClient.fetchQuery(orpc.webflow.exportComponents.queryOptions({ input: {} })),
  });

  // Update token saved status when query updates
  React.useEffect(() => {
    if (tokenStatus?.hasToken) {
      setTokenSaved(true);
    }
  }, [tokenStatus]);

  // Save token handler
  const handleSaveToken = async () => {
    if (!token.trim()) {
      setTokenError('Token cannot be empty');
      return;
    }

    setSavingToken(true);
    setTokenError(null);

    try {
      await saveTokenMutation.mutateAsync({ token: token.trim() });
      setTokenSaved(true);
      setToken(''); // Clear input for security
      queryClient.invalidateQueries({ queryKey: orpc.webflow.getWebflowToken.key() });
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : 'Failed to save token');
    } finally {
      setSavingToken(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    setExporting(true);
    setExportLogs([]);
    setExportResult(null);

    try {
      const result = await exportMutation.mutateAsync();

      setExportLogs(result.logs || []);
      setExportResult({
        success: result.success,
        error: result.error,
        deploymentUrl: result.deploymentUrl,
      });
    } catch (error) {
      setExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setExporting(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webflow Integration</h1>
        <p className="text-muted-foreground mt-2">
          Export selected components to your Webflow workspace
        </p>
      </div>

      {/* Token Setup Card */}
      {!tokenSaved && (
        <Card>
          <CardHeader>
            <CardTitle>Webflow Workspace Token</CardTitle>
            <CardDescription>
              Enter your Webflow workspace API token to enable component export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="wf_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={savingToken}
              />
              {tokenError && (
                <p className="text-sm text-destructive">{tokenError}</p>
              )}
            </div>
            <Button onClick={handleSaveToken} disabled={savingToken || !token.trim()}>
              {savingToken && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Token
            </Button>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Get your token from Webflow Account Settings → API Access
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Token Status */}
      {tokenSaved && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Webflow Token Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Your workspace token is securely stored
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await queryClient.fetchQuery(orpc.webflow.revokeWebflowToken.queryOptions());
                    setTokenSaved(false);
                    queryClient.invalidateQueries({ queryKey: orpc.webflow.getWebflowToken.key() });
                  } catch (error) {
                    console.error('Failed to revoke token:', error);
                  }
                }}
              >
                Revoke Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export to Webflow */}
      {tokenSaved && (
        <Card>
          <CardHeader>
            <CardTitle>Export to Webflow</CardTitle>
            <CardDescription>
              Build and deploy all components to your Webflow workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleExport}
              disabled={exporting}
              size="lg"
              className="w-full"
            >
              {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {exporting ? 'Exporting...' : 'Export All Components to Webflow'}
            </Button>

            {/* Build Logs */}
            {exportLogs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Build Logs</h4>
                <div
                  className="bg-muted p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto"
                  data-testid="build-logs"
                >
                  {exportLogs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Result */}
            {exportResult && (
              <Alert variant={exportResult.success ? 'default' : 'destructive'}>
                {exportResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {exportResult.success ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Success!</strong> Components exported to Webflow
                      </p>
                      {exportResult.deploymentUrl && (
                        <a
                          href={exportResult.deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                          data-testid="deployment-url"
                        >
                          View in Webflow Dashboard
                        </a>
                      )}
                    </div>
                  ) : (
                    <div>
                      <strong>Export Failed:</strong> {exportResult.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
