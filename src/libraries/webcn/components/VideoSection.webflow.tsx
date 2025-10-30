/**
 * VideoSection Webflow Component Wrapper
 * Video section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import VideoSection from '@/components/webcn/landing_page/webcn.webflow.io/VideoSection';
import '@/lib/styles/globals.css';

export function VideoSectionWrapper() {
  return <VideoSection />;
}

export default declareComponent(VideoSectionWrapper, {
  name: 'webcn Video Section',
  description: 'Video section with placeholder for demo video',
  group: 'webcn Landing',
  props: {},
});
