/**
 * ComponentDetailHeader Webflow Component Wrapper
 * Header section showing component name, description, and tags
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailHeader, { type ComponentDetailHeaderProps } from '@/components/registry-dashboard/ComponentDetailHeader';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailHeaderWrapper({ componentId }: ComponentDetailHeaderProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailHeader componentId={componentId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailHeaderWrapper, {
  name: 'Component Detail Header',
  description: 'Header section showing component name, description, library badge, and tags',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to display (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
  },
});
