/**
 * Post View Webflow Component Wrapper
 * Wraps the PostView component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import PostView from '@/components/PostView';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface PostViewWebflowProps {
  postId?: string;
  showBackButton: boolean;
}

export function PostViewWrapper({
  postId,
  showBackButton: _showBackButton,
}: PostViewWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <PostView postId={postId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PostViewWrapper, {
  name: 'Post View',
  description: 'Individual post view with full content, author info, and edit capability. Reads post ID from URL ?id=POST_ID (preferred) or from prop.',
  group: 'BlogFlow Demo',
  props: {
    postId: props.Text({
      name: 'Post ID',
      defaultValue: '',
      tooltip: 'ID of the post to display. URL param ?id=POST_ID takes precedence over this prop.',
    }),
    showBackButton: props.Boolean({
      name: 'Show Back Button',
      defaultValue: true,
      tooltip: 'Show back to blog button',
    }),
  },
});
