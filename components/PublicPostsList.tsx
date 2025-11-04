'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface PublicPostsListProps {
  pageSize?: number;
  enableSearch?: boolean;
}

export default function PublicPostsList({
  pageSize = 9,
  enableSearch = true,
}: PublicPostsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate offset based on current page
  const offset = (currentPage - 1) * pageSize;

  // Fetch published posts
  const { data: posts, isLoading, error } = useQuery(
    orpc.posts.publicList.queryOptions({
      input: {
        search: searchQuery || undefined,
        limit: pageSize,
        offset,
      },
    })
  );

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '. . .';
  };

  // Reset to page 1 when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination controls
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if there are more pages
  const hasMore = posts && posts.length === pageSize;
  const hasPrevious = currentPage > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600 text-lg">Latest published posts</p>
      </div>

      {/* Search */}
      {enableSearch && (
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

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
          <p className="text-gray-500 text-lg">No published posts yet</p>
          <p className="text-gray-400 mt-2">Check back soon for new content!</p>
        </div>
      )}

      {/* Posts list */}
      {!isLoading && !error && posts && posts.length > 0 && (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col">
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {truncateText(post.excerpt, 120) || 'No excerpt available'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Author */}
                    {post.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{(post.author as { displayName?: string })?.displayName || 'Unknown author'}</span>
                      </div>
                    )}

                    {/* Published Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      window.location.href = `/post?id=${post.id}`;
                    }}
                  >
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Page {currentPage}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={!hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
