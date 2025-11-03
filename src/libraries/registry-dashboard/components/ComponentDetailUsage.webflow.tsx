/**
 * ComponentDetailUsage Webflow Component Wrapper
 * Code usage example with copy button
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailUsage, { type ComponentDetailUsageProps } from '@/components/registry-dashboard/ComponentDetailUsage';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailUsageWrapper({ componentId }: ComponentDetailUsageProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailUsage componentId={componentId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailUsageWrapper, {
  name: 'Component Detail Usage',
  description: 'Code example showing how to use the component with copy button',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to show usage for (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
  },
});
