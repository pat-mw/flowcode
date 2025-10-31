'use client';

import { declareComponent } from '@webflow/react';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import PostsList from '@/components/PostsList';

export function PostsListWrapper() {
  return (
    <WebflowProvidersWrapper>
      <PostsList />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PostsListWrapper, {
  name: 'Posts List',
  description: 'Display and manage user posts with filtering and search',
  group: 'BlogFlow',
  props: {},
});
