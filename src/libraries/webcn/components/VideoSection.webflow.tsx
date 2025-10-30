/**
 * VideoSection Webflow Component Wrapper
 * Video section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import VideoSection, { type VideoSectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/VideoSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function VideoSectionWrapper({
  sectionTitle,
  sectionSubtitle,
  placeholderText,
}: VideoSectionProps) {
  return (
    <WebflowProvidersWrapper>
      <VideoSection
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        placeholderText={placeholderText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(VideoSectionWrapper, {
  name: 'webcn Video Section',
  description: 'Video section with placeholder for demo video',
  group: 'webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'See webcn in Action',
      tooltip: 'Main heading for the video section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: "Watch how we're reimagining what's possible in Webflow",
      tooltip: 'Subtitle text below the section heading',
    }),
    placeholderText: props.Text({
      name: 'Placeholder Text',
      defaultValue: 'Full demo video coming soon',
      tooltip: 'Text displayed below the video placeholder',
    }),
  },
});
