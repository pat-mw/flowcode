/**
 * ComponentCard Webflow Component Wrapper
 * Individual component card for showcasing components in collection lists
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props, PropType, PropValues } from '@webflow/data-types';
import ComponentCard, { type ComponentCardProps } from '@/components/webcn/landing_page/webcn.webflow.io/ComponentCard';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

// Webflow props type with Link instead of string
type WebflowComponentCardProps = {
  link: PropValues[PropType.Link];
} & Omit<ComponentCardProps, 'link'>;

export function ComponentCardWrapper({
  link,
  previewImage,
  componentName,
  category,
  description,
  buttonText,
  isFullStack,
}: WebflowComponentCardProps) {
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
  group: 'Registry Dashboard',
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
    link: props.Link({
      name: 'Link URL',
      tooltip: 'Link to component details or demo (includes URL, target, and preload options)',
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
