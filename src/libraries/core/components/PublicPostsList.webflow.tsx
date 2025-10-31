'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import PublicPostsList from '@/components/PublicPostsList';

interface PublicPostsListWrapperProps {
  initialLimit?: number;
  enableSearch?: boolean;
}

export function PublicPostsListWrapper({
  initialLimit = 10,
  enableSearch = true,
}: PublicPostsListWrapperProps) {
  return (
    <WebflowProvidersWrapper>
      <PublicPostsList initialLimit={initialLimit} enableSearch={enableSearch} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PublicPostsListWrapper, {
  name: 'Public Posts List',
  description: 'Display all published blog posts with search and pagination',
  group: 'BlogFlow',
  props: {
    initialLimit: props.Number({
      name: 'Posts Per Page',
      defaultValue: 10,
      tooltip: 'Number of posts to show initially',
    }),
    enableSearch: props.Boolean({
      name: 'Enable Search',
      defaultValue: true,
      tooltip: 'Show search box for filtering posts',
    }),
  },
});
