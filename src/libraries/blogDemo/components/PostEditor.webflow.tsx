/**
 * PostEditor Webflow Component Wrapper
 * Rich text editor for creating and editing blog posts
 */

'use client';

import { declareComponent } from '@webflow/react';
import PostEditorNew from '@/components/PostEditorNew';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function PostEditorWrapper() {
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
  description: 'Rich text editor with auto-save for creating and editing blog posts. Reads post ID from URL (?post=123).',
  group: 'BlogFlow Demo',
  props: {},
});
