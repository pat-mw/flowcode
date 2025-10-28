/**
 * PostEditor Component
 * Rich text editor for creating and editing blog posts
 * Uses browser-native APIs only - works in both Next.js and Webflow
 */

'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
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

type SaveStatus = 'saved' | 'saving' | 'error' | null;

export default function PostEditor() {
  // Browser-native URL parameter reading (works in both Next.js and Webflow)
  const [postId, setPostId] = React.useState<string | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [content, setContent] = React.useState<Record<string, unknown> | null>(null);

  // UI state
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Auto-save timer ref
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Tiptap editor setup
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

  // Read post ID from URL on mount (browser-native)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('post');
      setPostId(id);
      setIsEditMode(!!id);
    }
  }, []);

  // Fetch post data in edit mode
  React.useEffect(() => {
    if (!isEditMode || !postId) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/getById`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const post = await response.json();

        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setCoverImage(post.coverImage || '');

        // Set editor content
        if (editor && post.content) {
          editor.commands.setContent(post.content);
        }
        setContent(post.content);
      } catch (err) {
        console.error('Fetch post error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [isEditMode, postId, editor]);

  // Save handler (manual or auto-save)
  const handleSave = React.useCallback(async (isSilent = false) => {
    if (!title.trim()) {
      if (!isSilent) {
        setError('Title is required');
      }
      return;
    }

    try {
      if (!isSilent) {
        setIsSaving(true);
      }
      setSaveStatus('saving');
      setError(null);

      const endpoint = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/update`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/create`;

      const body = isEditMode
        ? {
            id: postId,
            title,
            content,
            excerpt: excerpt || undefined,
            coverImage: coverImage || undefined,
          }
        : {
            title,
            content,
            excerpt: excerpt || undefined,
            coverImage: coverImage || undefined,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      const savedPost = await response.json();

      // If creating new post, update to edit mode
      if (!isEditMode && savedPost.id) {
        setPostId(savedPost.id);
        setIsEditMode(true);
        // Update URL without reload (browser-native)
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?post=${savedPost.id}`;
          window.history.replaceState({}, '', newUrl);
        }
      }

      setSaveStatus('saved');

      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      if (!isSilent) {
        setError(err instanceof Error ? err.message : 'Failed to save post');
      }
    } finally {
      if (!isSilent) {
        setIsSaving(false);
      }
    }
  }, [title, content, excerpt, coverImage, isEditMode, postId]);

  // Auto-save logic (30 seconds debounce)
  React.useEffect(() => {
    if (!isEditMode || !title || !content) return;

    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true); // true = silent auto-save
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, excerpt, coverImage, isEditMode, handleSave]);

  // Publish handler
  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Save first if not in edit mode
      if (!isEditMode) {
        await handleSave(false);
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Then publish
      const currentPostId = postId;
      if (!currentPostId) {
        throw new Error('Post ID not found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/publish`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentPostId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish post');
      }

      // Navigate back to posts list (browser-native)
      window.location.href = '/dashboard/posts';
    } catch (err) {
      console.error('Publish error:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!postId) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/delete`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Navigate back to posts list (browser-native)
      window.location.href = '/dashboard/posts';
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      setIsSaving(false);
    }
  };

  // Toolbar button component
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

  // Loading state
  if (isLoading) {
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
                  <span className="text-green-600 dark:text-green-400">Saved</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-destructive">Error saving</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

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
                onClick={() => handleSave(false)}
                disabled={isSaving || !title.trim()}
                variant="outline"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSaving || !title.trim()}
              >
                {isSaving ? 'Publishing...' : 'Publish'}
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
