/**
 * ComponentDetailPreview Webflow Component Wrapper
 * Live preview of the component with default props
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailPreview, { type ComponentDetailPreviewProps } from '@/components/registry-dashboard/ComponentDetailPreview';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailPreviewWrapper({ componentId }: ComponentDetailPreviewProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailPreview componentId={componentId} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailPreviewWrapper, {
  name: 'Component Detail Preview',
  description: 'Live preview of the component with default props',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to preview (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
  },
});
