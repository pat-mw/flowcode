/**
 * StorySection Webflow Component Wrapper
 * Story section about the hackathon for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import StorySection from '@/components/webcn/landing_page/webcn.webflow.io/StorySection';
import '@/lib/styles/globals.css';

export function StorySectionWrapper() {
  return <StorySection />;
}

export default declareComponent(StorySectionWrapper, {
  name: 'webcn Story Section',
  description: 'Story section explaining the hackathon challenge, vision, and impact',
  group: 'webcn Landing',
  props: {},
});
