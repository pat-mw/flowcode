'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import FeaturesSummary from '@/components/webcn/landing_page/webcn.webflow.io/FeaturesSummary';

export interface FeaturesSummaryWrapperProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function FeaturesSummaryWrapper({
  sectionTitle,
  sectionSubtitle,
  ctaText,
  ctaLink,
}: FeaturesSummaryWrapperProps) {
  return (
    <WebflowProvidersWrapper>
      <FeaturesSummary
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        ctaText={ctaText}
        ctaLink={ctaLink}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(FeaturesSummaryWrapper, {
  name: 'Features Summary',
  description: 'High-level features summary section highlighting modular, typesafe, and authenticated architecture',
  group: 'Webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Built for Modern Web Development',
      tooltip: 'Main heading for the features summary section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Everything you need to build production-ready applications in Webflow',
      tooltip: 'Subtitle text below the main heading',
    }),
    ctaText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'Explore All Features',
      tooltip: 'Text displayed on the call-to-action button',
    }),
    ctaLink: props.Text({
      name: 'CTA Link',
      defaultValue: '/lander/webcn/features',
      tooltip: 'URL to navigate to when CTA button is clicked',
    }),
  },
});
