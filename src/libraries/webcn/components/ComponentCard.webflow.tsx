/**
 * ComponentCard Webflow Component Wrapper
 * Individual component card for showcasing components in collection lists
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentCard, { type ComponentCardProps } from '@/components/webcn/landing_page/webcn.webflow.io/ComponentCard';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function ComponentCardWrapper({
  previewImage,
  componentName,
  category,
  description,
  link,
  buttonText,
  isFullStack,
}: ComponentCardProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentCard
        previewImage={previewImage}
        componentName={componentName}
        category={category}
        description={description}
        link={link}
        buttonText={buttonText}
        isFullStack={isFullStack}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentCardWrapper, {
  name: 'Component Card',
  description: 'Individual component card for collection lists - displays component preview, name, category, and description',
  group: 'Webcn Landing',
  props: {
    previewImage: props.Text({
      name: 'Preview Image URL',
      defaultValue: '',
      tooltip: 'URL to preview image (leave empty for placeholder)',
    }),
    componentName: props.Text({
      name: 'Component Name',
      defaultValue: 'Component Name',
      tooltip: 'Name of the component',
    }),
    category: props.Text({
      name: 'Category',
      defaultValue: 'UI',
      tooltip: 'Category tag (e.g., UI, Full-Stack, Interactive)',
    }),
    description: props.RichText({
      name: 'Description',
      defaultValue: 'Component description',
      tooltip: 'Brief description of what the component does',
    }),
    link: props.Text({
      name: 'Link URL',
      defaultValue: '#',
      tooltip: 'URL to component details or demo',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'View Component',
      tooltip: 'Text displayed on the action button',
    }),
    isFullStack: props.Boolean({
      name: 'Is Full-Stack',
      defaultValue: false,
      tooltip: 'If true, uses primary badge color; if false, uses secondary',
    }),
  },
});
