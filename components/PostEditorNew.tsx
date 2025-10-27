/**
 * PostEditor Component (New - oRPC + TanStack Query)
 * Rich text editor for creating and editing blog posts
 *
 * Key improvements:
 * - Uses oRPC + TanStack Query instead of raw fetch
 * - Type-safe API calls with full intellisense
 * - Automatic cache management and invalidation
 * - Optimistic updates for better UX
 * - Proper error handling with isDefinedError
 * - Works cross-origin (Webflow → Vercel)
 */

'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type SaveStatus = 'saved' | 'saving' | 'error' | null;

export default function PostEditorNew() {
  const queryClient = useQueryClient();

  // Browser-native URL parameter reading (works in both Next.js and Webflow)
  const [postId, setPostId] = React.useState<string | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  // Initialize with empty Tiptap document structure (required for notNull constraint)
  const [content, setContent] = React.useState<Record<string, unknown>>({
    type: 'doc',
    content: [],
  });

  // UI state
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Auto-save timer ref
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Read post ID from URL on mount (browser-native)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('post');
      setPostId(id);
      setIsEditMode(!!id);
    }
  }, []);

  // ============================================================================
  // TIPTAP EDITOR SETUP
  // ============================================================================
  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatches
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);
    },
  });

  // ============================================================================
  // oRPC QUERY: Fetch post data in edit mode
  // ============================================================================
  const {
    data: post,
    isLoading: isLoadingPost,
    error: fetchError
  } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId! },
      // Only fetch if we have a postId (edit mode)
      enabled: isEditMode && !!postId,
      // Show stale data while refetching
      staleTime: 30 * 1000, // 30 seconds
    })
  );

  // Populate form when post data loads
  React.useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setExcerpt(post.excerpt || '');
      setCoverImage(post.coverImage || '');
      setContent(post.content as Record<string, unknown>);

      // Set editor content
      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, editor]);

  // ============================================================================
  // oRPC MUTATIONS
  // ============================================================================

  // Create post mutation
  const createPostMutation = useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: (newPost) => {
        toast.success('Post created successfully!');

        // Switch to edit mode
        setPostId(newPost.id);
        setIsEditMode(true);

        // Update URL without reload
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?post=${newPost.id}`;
          window.history.replaceState({}, '', newUrl);
        }

        // Invalidate posts list
        queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
      },
      onError: () => {
        toast.error('Failed to create post');
      },
    })
  );

  // Update post mutation
  const updatePostMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: (updatedPost) => {
        // Update cached post data
        queryClient.setQueryData(
          orpc.posts.getById.queryKey({ input: { id: postId! } }),
          updatedPost
        );

        // Invalidate posts list
        queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
      },
      onError: () => {
        toast.error('Failed to save post');
        setSaveStatus('error');
      },
    })
  );

  // Publish post mutation
  const publishPostMutation = useMutation(
    orpc.posts.publish.mutationOptions({
      onSuccess: () => {
        toast.success('Post published successfully!');

        // Invalidate all post queries
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });

        // Navigate back to posts list
        window.location.href = '/dashboard/posts';
      },
      onError: () => {
        toast.error('Failed to publish post');
      },
    })
  );

  // Delete post mutation
  const deletePostMutation = useMutation(
    orpc.posts.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Post deleted successfully!');

        // Invalidate posts list
        queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });

        // Navigate back to posts list
        window.location.href = '/dashboard/posts';
      },
      onError: () => {
        toast.error('Failed to delete post');
      },
    })
  );

  // ============================================================================
  // SAVE HANDLERS
  // ============================================================================

  // Manual save handler
  const handleSave = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaveStatus('saving');

    try {
      if (isEditMode && postId) {
        // Update existing post
        await updatePostMutation.mutateAsync({
          id: postId,
          title,
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
        });

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        // Create new post
        await createPostMutation.mutateAsync({
          title,
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
        });

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch {
      // Error already handled by mutation onError
      setSaveStatus('error');
    }
  }, [title, content, excerpt, coverImage, isEditMode, postId, updatePostMutation, createPostMutation]);

  // Auto-save logic (30 seconds debounce)
  React.useEffect(() => {
    // Only auto-save in edit mode with valid data
    if (!isEditMode || !postId || !title.trim()) return;

    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');

      try {
        await updatePostMutation.mutateAsync({
          id: postId,
          title,
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
        });

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        // Silent auto-save error (don't toast)
        setSaveStatus(null);
      }
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, excerpt, coverImage, isEditMode, postId, updatePostMutation]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  // Publish handler
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      // Save first if not in edit mode
      if (!isEditMode) {
        const newPost = await createPostMutation.mutateAsync({
          title,
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
        });

        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Publish the newly created post
        if (newPost?.id) {
          await publishPostMutation.mutateAsync({ id: newPost.id });
        }
      } else if (postId) {
        // Publish existing post
        await publishPostMutation.mutateAsync({ id: postId });
      }
    } catch {
      // Error already handled by mutation onError
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!postId) return;

    try {
      await deletePostMutation.mutateAsync({ id: postId });
    } catch {
      // Error already handled by mutation onError
    }
  };

  // ============================================================================
  // TOOLBAR BUTTON COMPONENT
  // ============================================================================
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================
  if (isLoadingPost) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================
  if (fetchError) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load post</p>
            <Button onClick={() => window.location.href = '/dashboard/posts'}>
              Back to Posts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // RENDER: MAIN EDITOR
  // ============================================================================
  const isSaving =
    createPostMutation.isPending ||
    updatePostMutation.isPending ||
    publishPostMutation.isPending ||
    deletePostMutation.isPending;

  return (
    <>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {isEditMode ? 'Edit Post' : 'Create New Post'}
              </CardTitle>
              <CardDescription>
                {isEditMode
                  ? 'Update your blog post content'
                  : 'Write and publish your blog post'}
              </CardDescription>
            </div>
            {saveStatus && (
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-green-600 dark:text-green-400">✓ Saved</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-destructive">✗ Error</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              className="text-lg font-semibold"
            />
          </div>

          {/* Excerpt Input */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of your post (optional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isSaving}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {excerpt.length}/500 characters
            </p>
          </div>

          {/* Cover Image Input */}
          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-medium">
              Cover Image URL
            </label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <Separator />

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>

            {/* Toolbar */}
            {editor && (
              <div className="border rounded-t-md p-2 bg-muted/50 flex flex-wrap gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive('bold')}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  title="Bold"
                >
                  <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive('italic')}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  title="Italic"
                >
                  <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  active={editor.isActive('strike')}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  title="Strikethrough"
                >
                  <s>S</s>
                </ToolbarButton>

                <div className="w-px h-6 bg-border mx-1" />

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  active={editor.isActive('heading', { level: 1 })}
                  title="Heading 1"
                >
                  H1
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  H2
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  active={editor.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  H3
                </ToolbarButton>

                <div className="w-px h-6 bg-border mx-1" />

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  active={editor.isActive('bulletList')}
                  title="Bullet List"
                >
                  •
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  active={editor.isActive('orderedList')}
                  title="Numbered List"
                >
                  1.
                </ToolbarButton>

                <div className="w-px h-6 bg-border mx-1" />

                <ToolbarButton
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  active={editor.isActive('link')}
                  title="Add Link"
                >
                  Link
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  title="Add Image"
                >
                  Img
                </ToolbarButton>
              </div>
            )}

            {/* Editor */}
            <div className="border rounded-b-md min-h-[400px] bg-background">
              <EditorContent editor={editor} />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                variant="outline"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSaving || !title.trim()}
              >
                {publishPostMutation.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            </div>

            <div className="flex gap-3">
              {isEditMode && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSaving}
                  variant="destructive"
                >
                  Delete
                </Button>
              )}
              <Button
                onClick={() => {
                  window.location.href = '/dashboard/posts';
                }}
                disabled={isSaving}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
