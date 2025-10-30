/**
 * StorySection Webflow Component Wrapper
 * Story section about the hackathon for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import StorySection, { type StorySectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/StorySection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function StorySectionWrapper({ sectionTitle, sectionSubtitle }: StorySectionProps) {
  return (
    <WebflowProvidersWrapper>
      <StorySection sectionTitle={sectionTitle} sectionSubtitle={sectionSubtitle} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(StorySectionWrapper, {
  name: 'webcn Story Section',
  description: 'Story section explaining the hackathon challenge, vision, and impact',
  group: 'webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'The Hackathon Story',
      tooltip: 'Main heading for the story section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Why we\'re building a framework instead of "just another website"',
      tooltip: 'Subtitle text below the section heading',
    }),
  },
});
