/**
 * ComponentDetailHeader Webflow Component Wrapper
 * Header section showing component name, description, and tags
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailHeader, { type ComponentDetailHeaderProps } from '@/components/registry-dashboard/ComponentDetailHeader';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import type { WebflowCMSComponent } from '@/lib/webflow-cms-types';

interface WrapperProps extends ComponentDetailHeaderProps {
  // CMS fields from Webflow CMS Components Collection
  cmsName?: string;
  cmsComponentId?: string;
  cmsDescription?: string;
  cmsCategory?: string;
  cmsTags?: string; // Comma-separated tags
}

export function ComponentDetailHeaderWrapper({
  componentId,
  cmsName,
  cmsComponentId,
  cmsDescription,
  cmsCategory,
  cmsTags,
}: WrapperProps) {
  // Build CMS data object from individual props
  const cmsData: WebflowCMSComponent | undefined = (cmsName || cmsComponentId || cmsDescription || cmsCategory || cmsTags)
    ? {
        name: cmsName,
        componentId: cmsComponentId,
        description: cmsDescription,
        category: cmsCategory,
        tags: cmsTags,
      }
    : undefined;

  return (
    <WebflowProvidersWrapper>
      <ComponentDetailHeader componentId={componentId} cmsData={cmsData} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailHeaderWrapper, {
  name: 'Component Detail Header',
  description: 'Header section showing component name, description, library badge, and tags. Supports CMS data injection.',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to display (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
    cmsName: props.Text({
      name: 'CMS: Name',
      defaultValue: '',
      tooltip: 'Optional: Component name from Webflow CMS. Bind to CMS field "name".',
    }),
    cmsComponentId: props.Text({
      name: 'CMS: Component ID',
      defaultValue: '',
      tooltip: 'Optional: Component ID from Webflow CMS. Bind to CMS field "component-id".',
    }),
    cmsDescription: props.Text({
      name: 'CMS: Description',
      defaultValue: '',
      tooltip: 'Optional: Component description from Webflow CMS. Bind to CMS field "description".',
    }),
    cmsCategory: props.Text({
      name: 'CMS: Category',
      defaultValue: '',
      tooltip: 'Optional: Component category from Webflow CMS. Bind to CMS field "category".',
    }),
    cmsTags: props.Text({
      name: 'CMS: Tags',
      defaultValue: '',
      tooltip: 'Optional: Comma-separated tags from Webflow CMS. Bind to CMS field "tags".',
    }),
  },
});
