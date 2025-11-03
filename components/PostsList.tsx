'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Edit, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PostsList() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts, isLoading, error } = useQuery(
    orpc.posts.list.queryOptions({
      input: {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        limit: 50,
        offset: 0,
      },
    })
  );

  // Delete mutation
  const deleteMutation = useMutation(
    orpc.posts.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key()});
        toast.success('Post deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete post: ${error.message}`);
      },
    })
  );

  // Publish mutation
  const publishMutation = useMutation(
    orpc.posts.publish.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
        toast.success('Post published successfully');
      },
      onError: (error) => {
        toast.error(`Failed to publish post: ${error.message}`);
      },
    })
  );

  const handleEdit = (postId: string) => {
    window.location.href = `/dashboard/edit?post=${postId}`;
  };

  const handleDelete = (postId: string, postTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      deleteMutation.mutate({ id: postId });
    }
  };

  const handlePublish = (postId: string) => {
    publishMutation.mutate({ id: postId });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not published';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Posts</h1>
        <p className="text-gray-600">Manage your blog posts</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('published')}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts
          </Button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error loading posts</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && posts && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No posts found</p>
          <Button onClick={() => (window.location.href = '/dashboard/edit')}>
            Create your first post
          </Button>
        </div>
      )}

      {/* Posts list */}
      {!isLoading && !error && posts && posts.length > 0 && (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <CardDescription>
                      {post.excerpt || 'No excerpt available'}
                    </CardDescription>
                  </div>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>
                    Created: {formatDate(post.createdAt)} • Updated:{' '}
                    {formatDate(post.updatedAt)}
                  </p>
                  {post.publishedAt && (
                    <p>Published: {formatDate(post.publishedAt)}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {post.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(post.id)}
                    disabled={publishMutation.isPending}
                  >
                    {publishMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Publish
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
