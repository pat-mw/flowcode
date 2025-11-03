/**
 * ComponentDetailPreview Webflow Component Wrapper
 * Live preview of the component with default props
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailPreview, { type ComponentDetailPreviewProps } from '@/components/registry-dashboard/ComponentDetailPreview';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentDetailPreviewWrapper({ componentId, previewBaseUrl }: ComponentDetailPreviewProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailPreview componentId={componentId} previewBaseUrl={previewBaseUrl} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailPreviewWrapper, {
  name: 'Component Detail Preview',
  description: 'Link to live component preview on production site',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to preview (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
    previewBaseUrl: props.Text({
      name: 'Preview Base URL',
      defaultValue: process.env.NEXT_PUBLIC_API_URL || '',
      tooltip: 'Base URL for the preview site (e.g., "https://yoursite.com"). Path /lander/webcn/component will be appended.',
    }),
  },
});
