/**
 * Posts List Webflow Component Wrapper
 * Wraps the PostsList component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import PostsList from '@/components/PostsList';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface PostsListWebflowProps {
  defaultFilter: 'all' | 'published' | 'draft';
  showCreateButton: boolean;
}

export function PostsListWrapper({
  defaultFilter,
  showCreateButton,
}: PostsListWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <PostsList />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PostsListWrapper, {
  name: 'Posts List',
  description: 'User\'s posts management dashboard with filtering, search, and CRUD operations',
  group: 'BlogFlow Demo',
  props: {
    defaultFilter: props.Variant({
      name: 'Default Filter',
      defaultValue: 'all',
      options: ['all', 'published', 'draft'],
      tooltip: 'Default filter for posts view',
    }),
    showCreateButton: props.Boolean({
      name: 'Show Create Button',
      defaultValue: true,
      tooltip: 'Show create new post button',
    }),
  },
});
