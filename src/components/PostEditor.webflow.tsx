/**
 * PostEditor Webflow Component
 * Rich text editor for creating and editing blog posts
 * Uses oRPC + TanStack Query for type-safe API calls with automatic caching
 */

'use client';

import { declareComponent } from '@webflow/react';
import PostEditorNew from '@/components/PostEditorNew';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

function PostEditorWrapper() {
  return (
    <WebflowProvidersWrapper>
      <div className="container mx-auto px-4 py-8">
        <PostEditorNew />
      </div>
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PostEditorWrapper, {
  name: 'Post Editor',
  description: 'Rich text editor with auto-save, type-safe API calls, and cross-origin support (Webflow → Vercel). Reads post ID from URL (?post=123).',
  group: 'BlogFlow',
  props: {},
});
