'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Loader2,
  Star,
  StarOff,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { orpc } from '@/lib/orpc-client';
import type { WaitlistEntry } from '@/lib/db/schema/waitlist';

export interface WaitlistAdminProps {
  title?: string;
  refreshInterval?: number;
}

const WaitlistAdmin = ({
  title = 'Waitlist Management',
  refreshInterval = 30000, // 30 seconds
}: WaitlistAdminProps) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // Query for entries
  const entriesQuery = useQuery(
    orpc.waitlist.getAll.queryOptions({
      status: selectedStatus as 'pending' | 'approved' | 'invited' | 'rejected' | undefined,
      limit: 50,
      offset: 0,
    })
  );

  // Query for stats
  const statsQuery = useQuery(orpc.waitlist.getStats.queryOptions());

  // Refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        entriesQuery.refetch();
        statsQuery.refetch();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Mutations
  const updateMutation = useMutation(
    orpc.waitlist.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.waitlist.getAll.key() });
        queryClient.invalidateQueries({ queryKey: orpc.waitlist.getStats.key() });
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.waitlist.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.waitlist.getAll.key() });
        queryClient.invalidateQueries({ queryKey: orpc.waitlist.getStats.key() });
      },
    })
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({
      id,
      status: newStatus as 'pending' | 'approved' | 'invited' | 'rejected',
    });
  };

  const handleTogglePriority = (id: string, currentPriority: boolean) => {
    updateMutation.mutate({
      id,
      isPriority: !currentPriority,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    deleteMutation.mutate({ id });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle2 },
      invited: { variant: 'default', icon: Mail },
      rejected: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const entries = entriesQuery.data?.entries || [];
  const stats = statsQuery.data || {
    total: 0,
    pending: 0,
    approved: 0,
    invited: 0,
    rejected: 0,
    priority: 0,
  };
  const isLoading = entriesQuery.isLoading || statsQuery.isLoading;
  const isRefreshing = entriesQuery.isRefetching || statsQuery.isRefetching;

  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            entriesQuery.refetch();
            statsQuery.refetch();
          }}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Invited</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.invited}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-card border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Priority</p>
            <p className="text-2xl font-bold text-primary">{stats.priority}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus(undefined)}
        >
          All
        </Button>
        <Button
          variant={selectedStatus === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('pending')}
        >
          Pending
        </Button>
        <Button
          variant={selectedStatus === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('approved')}
        >
          Approved
        </Button>
        <Button
          variant={selectedStatus === 'invited' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('invited')}
        >
          Invited
        </Button>
        <Button
          variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('rejected')}
        >
          Rejected
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-gradient-card border-border/50 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {entry.isPriority && (
                          <Star className="w-4 h-4 text-primary fill-current flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {entry.name || entry.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.email}
                          </p>
                          {entry.company && (
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePriority(entry.id, entry.isPriority)}
                          title={entry.isPriority ? 'Remove priority' : 'Mark as priority'}
                        >
                          {entry.isPriority ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        {entry.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(entry.id, 'approved')}
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {entry.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(entry.id, 'rejected')}
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default WaitlistAdmin;
