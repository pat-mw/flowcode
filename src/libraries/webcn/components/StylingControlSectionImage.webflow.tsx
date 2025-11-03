/**
 * StylingControlSectionImage Webflow Component Wrapper
 * Image-based variant showcasing design system integration (replaces live theme preview with configurable image)
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import StylingControlSectionImage, { type StylingControlSectionImageProps } from '@/components/webcn/landing_page/webcn.webflow.io/StylingControlSectionImage';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function StylingControlSectionImageWrapper({
  imageUrl,
  badgeText,
  sectionTitle,
  sectionSubtitle,
  feature1Title,
  feature1Description,
  feature2Title,
  feature2Description,
  feature3Title,
  feature3Description,
  showBadge,
}: StylingControlSectionImageProps) {
  return (
    <WebflowProvidersWrapper>
      <StylingControlSectionImage
        imageUrl={imageUrl}
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        feature1Title={feature1Title}
        feature1Description={feature1Description}
        feature2Title={feature2Title}
        feature2Description={feature2Description}
        feature3Title={feature3Title}
        feature3Description={feature3Description}
        showBadge={showBadge}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(StylingControlSectionImageWrapper, {
  name: 'webcn Styling Control (Image)',
  description: 'Image-based variant showcasing design system integration. Replaces live theme preview with a configurable GIF or static image.',
  group: 'webcn Landing',
  props: {
    imageUrl: props.Text({
      name: 'Image URL',
      defaultValue: '',
      tooltip: 'URL to GIF or static image showcasing the styling/theming demo. Leave empty for placeholder.',
    }),
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Design System',
      tooltip: 'Text displayed in the badge above the section title',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Complete Styling Control',
      tooltip: 'Main heading for the section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Full design system integration with shadcn/ui core tokens and libraries like tweakcn',
      tooltip: 'Subtitle text below the section heading',
    }),
    feature1Title: props.Text({
      name: 'Feature 1 Title',
      defaultValue: 'CSS Variables',
      tooltip: 'Title for the first feature',
    }),
    feature1Description: props.Text({
      name: 'Feature 1 Description',
      defaultValue: 'All components use CSS custom properties that automatically adapt to your design system. Change once, update everywhere.',
      tooltip: 'Description for the first feature',
    }),
    feature2Title: props.Text({
      name: 'Feature 2 Title',
      defaultValue: 'shadcn/ui Compatible',
      tooltip: 'Title for the second feature',
    }),
    feature2Description: props.Text({
      name: 'Feature 2 Description',
      defaultValue: 'Built on the same design tokens as shadcn/ui. Drop in any shadcn component and it just works with your theme.',
      tooltip: 'Description for the second feature',
    }),
    feature3Title: props.Text({
      name: 'Feature 3 Title',
      defaultValue: 'tweakcn Ready',
      tooltip: 'Title for the third feature',
    }),
    feature3Description: props.Text({
      name: 'Feature 3 Description',
      defaultValue: 'Fully compatible with tweakcn and other design tools. Adjust colors, spacing, and typography with zero code changes.',
      tooltip: 'Description for the third feature',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle the badge visibility above the section title',
    }),
  },
});
