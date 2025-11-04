/**
 * Public Posts List Webflow Component Wrapper
 * Wraps the PublicPostsList component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import PublicPostsList from '@/components/PublicPostsList';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface PublicPostsListWebflowProps {
  pageSize: number;
  enableSearch: boolean;
  title: string;
  subtitle: string;
}

export function PublicPostsListWrapper({
  pageSize,
  enableSearch,
  title,
  subtitle,
}: PublicPostsListWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <div>
        {/* Custom header if title/subtitle provided */}
        {(title !== 'Blog' || subtitle !== 'Latest published posts') && (
          <div className="container mx-auto px-4 pt-8 pb-0">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600 text-lg">{subtitle}</p>
            </div>
          </div>
        )}
        <PublicPostsList pageSize={pageSize} enableSearch={enableSearch} />
      </div>
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PublicPostsListWrapper, {
  name: 'Public Posts List',
  description: 'Public blog index with published posts, search, and pagination',
  group: 'BlogFlow Demo',
  props: {
    pageSize: props.Number({
      name: 'Posts Per Page',
      defaultValue: 9,
      tooltip: 'Number of posts to display per page',
    }),
    enableSearch: props.Boolean({
      name: 'Enable Search',
      defaultValue: true,
      tooltip: 'Enable search functionality',
    }),
    title: props.Text({
      name: 'Page Title',
      defaultValue: 'Blog',
      tooltip: 'Main heading for the blog page',
    }),
    subtitle: props.Text({
      name: 'Page Subtitle',
      defaultValue: 'Latest published posts',
      tooltip: 'Subheading text for the blog page',
    }),
  },
});
