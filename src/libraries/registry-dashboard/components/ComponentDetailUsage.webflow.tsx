/**
 * ComponentDetailUsage Webflow Component Wrapper
 * Code usage example with copy button
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailUsage, { type ComponentDetailUsageProps } from '@/components/registry-dashboard/ComponentDetailUsage';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import type { WebflowCMSComponent } from '@/lib/webflow-cms-types';

interface WrapperProps extends ComponentDetailUsageProps {
  // CMS field from Webflow CMS Components Collection
  cmsUsageExample?: string;
}

export function ComponentDetailUsageWrapper({
  componentId,
  cmsUsageExample,
}: WrapperProps) {
  // Build CMS data object from individual props
  const cmsData: WebflowCMSComponent | undefined = cmsUsageExample
    ? { usageExample: cmsUsageExample }
    : undefined;

  return (
    <WebflowProvidersWrapper>
      <ComponentDetailUsage componentId={componentId} cmsData={cmsData} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailUsageWrapper, {
  name: 'Component Detail Usage',
  description: 'Code example showing how to use the component with copy button. Supports CMS data injection.',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to show usage for (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
    cmsUsageExample: props.Text({
      name: 'CMS: Usage Example',
      defaultValue: '',
      tooltip: 'Optional: Code usage example from Webflow CMS. Bind to CMS field "usage-example".',
    }),
  },
});
