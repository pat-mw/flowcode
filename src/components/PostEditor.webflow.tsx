/**
 * PostEditor Webflow Component Wrapper
 * Wraps the PostEditor component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import PostEditor from '@/components/PostEditor';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

function PostEditorWrapper() {
  return (
    <WebflowProvidersWrapper>
      <PostEditor />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PostEditorWrapper, {
  name: 'Post Editor',
  description: 'Rich text editor for creating and editing blog posts. Reads post ID from URL query parameter (?post=123).',
  group: 'Blog',
  props: {
    // No props - reads post ID from URL query parameter
  },
});
