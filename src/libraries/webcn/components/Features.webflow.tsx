/**
 * Features Webflow Component Wrapper
 * Features grid section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Features, { type FeaturesProps } from '@/components/webcn/landing_page/webcn.webflow.io/Features';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function FeaturesWrapper({ sectionTitle, sectionSubtitle }: FeaturesProps) {
  return (
    <WebflowProvidersWrapper>
      <Features sectionTitle={sectionTitle} sectionSubtitle={sectionSubtitle} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(FeaturesWrapper, {
  name: 'webcn Features',
  description: 'Feature grid showcasing key features with icons and descriptions',
  group: 'webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'More Than Just Components',
      tooltip: 'Main heading for the features section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'A complete framework for building production applications in Webflow',
      tooltip: 'Subtitle text below the section heading',
    }),
  },
});
