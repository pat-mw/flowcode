/**
 * ComponentDetailProps Webflow Component Wrapper
 * Documentation table showing all component props
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailProps, { type ComponentDetailPropsProps } from '@/components/registry-dashboard/ComponentDetailProps';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailPropsWrapper({ componentId }: ComponentDetailPropsProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailProps componentId={componentId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailPropsWrapper, {
  name: 'Component Detail Props',
  description: 'Documentation table showing component props with types, descriptions, and default values',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to show props for (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
  },
});
