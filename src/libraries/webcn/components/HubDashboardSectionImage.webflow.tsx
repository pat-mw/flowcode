/**
 * HubDashboardSectionImage Webflow Component Wrapper
 * Image-based variant of the hub dashboard (replaces interactive UI with configurable image)
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props, PropValues, PropType } from '@webflow/data-types';
import HubDashboardSectionImage, { type HubDashboardSectionImageProps } from '@/components/webcn/landing_page/webcn.webflow.io/HubDashboardSectionImage';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

// Type for Webflow wrapper props (receives image object from props.Image)
type HubDashboardSectionImageWrapperProps = {
  image?: PropValues[PropType.Image]; // Webflow Image prop returns { src: string; alt?: string }
} & Omit<HubDashboardSectionImageProps, 'imageSrc' | 'imageAlt'>;

export function HubDashboardSectionImageWrapper({
  image,
  badgeText,
  sectionTitle,
  sectionSubtitle,
  showBadge,
  feature1Title,
  feature1Description,
  feature2Title,
  feature2Description,
  feature3Title,
  feature3Description,
}: HubDashboardSectionImageWrapperProps) {
  return (
    <WebflowProvidersWrapper>
      <HubDashboardSectionImage
        imageSrc={image?.src}
        imageAlt={image?.alt}
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        showBadge={showBadge}
        feature1Title={feature1Title}
        feature1Description={feature1Description}
        feature2Title={feature2Title}
        feature2Description={feature2Description}
        feature3Title={feature3Title}
        feature3Description={feature3Description}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(HubDashboardSectionImageWrapper, {
  name: 'webcn Hub Dashboard (Image)',
  description: 'Image-based variant of the management dashboard. Replaces interactive UI with a configurable screenshot or GIF.',
  group: 'webcn Landing',
  props: {
    image: props.Image({
      name: 'Dashboard Image',
      group: 'Content',
      tooltip: 'Select a screenshot or GIF from your Webflow asset library showing the hub dashboard',
    }),
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Management Hub',
      tooltip: 'Text displayed in the badge above the section title',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Control Center for Your Stack',
      tooltip: 'Main heading for the section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Connect services, install libraries, and configure your backend — all from one dashboard',
      tooltip: 'Subtitle text below the section heading',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle the badge visibility above the section title',
    }),
    feature1Title: props.Text({
      name: 'Feature 1 Title',
      defaultValue: 'One-Click Setup',
      tooltip: 'Title for the first feature below the dashboard',
    }),
    feature1Description: props.Text({
      name: 'Feature 1 Description',
      defaultValue: 'Connect your accounts and deploy in minutes',
      tooltip: 'Description for the first feature',
    }),
    feature2Title: props.Text({
      name: 'Feature 2 Title',
      defaultValue: 'Modular Libraries',
      tooltip: 'Title for the second feature below the dashboard',
    }),
    feature2Description: props.Text({
      name: 'Feature 2 Description',
      defaultValue: 'Install only what you need, when you need it',
      tooltip: 'Description for the second feature',
    }),
    feature3Title: props.Text({
      name: 'Feature 3 Title',
      defaultValue: 'Full Control',
      tooltip: 'Title for the third feature below the dashboard',
    }),
    feature3Description: props.Text({
      name: 'Feature 3 Description',
      defaultValue: 'Configure every aspect of your deployment',
      tooltip: 'Description for the third feature',
    }),
  },
});
