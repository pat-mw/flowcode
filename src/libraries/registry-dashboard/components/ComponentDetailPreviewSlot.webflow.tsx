/**
 * ComponentDetailPreviewSlot Webflow Component Wrapper
 * Slot-based version of component preview that accepts images from Webflow
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailPreviewSlot, { type ComponentDetailPreviewSlotProps } from '@/components/registry-dashboard/ComponentDetailPreviewSlot';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

interface ComponentDetailPreviewSlotWrapperProps extends Omit<ComponentDetailPreviewSlotProps, 'children'> {
  children?: React.ReactNode; // Slot content
}

export function ComponentDetailPreviewSlotWrapper({
  componentId,
  previewBaseUrl,
  children
}: ComponentDetailPreviewSlotWrapperProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentDetailPreviewSlot
        componentId={componentId}
        previewBaseUrl={previewBaseUrl}
      >
        {children}
      </ComponentDetailPreviewSlot>
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailPreviewSlotWrapper, {
  name: 'Component Detail Preview (Slot)',
  description: 'Component preview card with slot for custom images. Includes hover overlay and footer button.',
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
    children: props.Slot({
      name: 'Preview Image',
      tooltip: 'Slot for component preview image. Drop an image or any element here.',
    }),
  },
});
