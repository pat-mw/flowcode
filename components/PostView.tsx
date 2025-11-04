'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, ArrowLeft, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useParamOrProp } from '@/hooks/useParamOrProp';

interface PostViewProps {
  postId?: string;
}

// TipTap JSON content types
interface TipTapTextContent {
  text: string;
  type?: string;
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[] | TipTapTextContent[];
  attrs?: Record<string, unknown>;
}

interface TipTapDocument {
  type: string;
  content: TipTapNode[];
}

interface PostAuthor {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

export default function PostView({ postId: postIdProp }: PostViewProps) {
  const { user } = useAuthStore();

  // URL search param takes precedence over prop
  // This allows using ?id=123 in the URL or passing postId as a prop
  const postId = useParamOrProp('id', postIdProp) as string;

  // Fetch single post by ID using efficient publicGetById endpoint
  const { data: post, isLoading, error } = useQuery({
    ...orpc.posts.publicGetById.queryOptions({
      input: {
        id: postId,
      },
    }),
    enabled: !!postId, // Only fetch if postId is available
  });

  // Handle missing postId
  if (!postId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">No Post Selected</h2>
              <p className="text-muted-foreground">
                Please provide a post ID via URL parameter (?id=POST_ID) or component prop
              </p>
              <Button onClick={() => window.location.href = '/blog'}>
                View All Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBack = () => {
    window.location.href = '/blog';
  };

  const handleEdit = () => {
    window.location.href = `/dashboard/edit?post=${postId}`;
  };

  // Check if current user is the author
  const isAuthor = post && user && (post.author as PostAuthor)?.userId === user.id;

  // Render content from Tiptap JSON
  const renderContent = (content: TipTapDocument | string) => {
    if (!content) return null;

    // Basic Tiptap JSON to HTML rendering
    // This is simplified - in production you'd use Tiptap's generateHTML
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Handle Tiptap JSON structure
    if (content.type === 'doc' && content.content) {
      return (
        <div className="prose prose-lg max-w-none">
          {content.content.map((node: TipTapNode, index: number) => {
            if (node.type === 'paragraph') {
              const text = node.content?.map((c) => ('text' in c ? c.text : '')).join('') || '';
              return <p key={index}>{text}</p>;
            }
            if (node.type === 'heading') {
              const text = node.content?.map((c) => ('text' in c ? c.text : '')).join('') || '';
              const level = (node.attrs?.level as number) || 1;
              switch (level) {
                case 1:
                  return <h1 key={index}>{text}</h1>;
                case 2:
                  return <h2 key={index}>{text}</h2>;
                case 3:
                  return <h3 key={index}>{text}</h3>;
                case 4:
                  return <h4 key={index}>{text}</h4>;
                case 5:
                  return <h5 key={index}>{text}</h5>;
                case 6:
                  return <h6 key={index}>{text}</h6>;
                default:
                  return <h2 key={index}>{text}</h2>;
              }
            }
            if (node.type === 'bulletList') {
              const listItems = node.content as TipTapNode[] | undefined;
              return (
                <ul key={index}>
                  {listItems?.map((item, i: number) => (
                    <li key={i}>
                      {(item.content as TipTapNode[] | undefined)?.map((p) =>
                        (p.content as TipTapTextContent[] | undefined)?.map((c) => c.text).join('')
                      )}
                    </li>
                  ))}
                </ul>
              );
            }
            if (node.type === 'orderedList') {
              const listItems = node.content as TipTapNode[] | undefined;
              return (
                <ol key={index}>
                  {listItems?.map((item, i: number) => (
                    <li key={i}>
                      {(item.content as TipTapNode[] | undefined)?.map((p) =>
                        (p.content as TipTapTextContent[] | undefined)?.map((c) => c.text).join('')
                      )}
                    </li>
                  ))}
                </ol>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return <p className="text-gray-500">Content format not supported</p>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
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
          <p className="font-semibold">Error loading post</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Post not found */}
      {!isLoading && !error && !post && (
        <Card>
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
            <CardDescription>
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>
              Return to Blog
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post content */}
      {!isLoading && !error && post && (
        <article>
          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
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

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
              {isAuthor && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </Button>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-6 text-gray-600 border-t border-b py-4">
              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-2">
                  {(post.author as PostAuthor).avatarUrl && (
                    <img
                      src={(post.author as PostAuthor).avatarUrl}
                      alt={(post.author as PostAuthor).displayName || 'Author'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {(post.author as PostAuthor).displayName || 'Unknown author'}
                      </span>
                    </div>
                    {(post.author as PostAuthor).bio && (
                      <p className="text-sm text-gray-500">
                        {(post.author as PostAuthor).bio}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Published Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mb-8">
            {renderContent(post.content as TipTapDocument | string)}
          </div>

          {/* Footer */}
          <footer className="border-t pt-8">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>

              {isAuthor && (
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit This Post
                </Button>
              )}
            </div>
          </footer>
        </article>
      )}
    </div>
  );
}
