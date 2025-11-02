/**
 * ComponentDetailSidebar Webflow Component Wrapper
 * Sidebar showing component metadata, dependencies, and library info
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailSidebar, { type ComponentDetailSidebarProps } from '@/components/registry-dashboard/ComponentDetailSidebar';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailSidebarWrapper({ componentId }: ComponentDetailSidebarProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailSidebar componentId={componentId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailSidebarWrapper, {
  name: 'Component Detail Sidebar',
  description: 'Sidebar showing component metadata, category, library info, dependencies, and file path',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to show metadata for (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
  },
});
