/**
 * BlogCTA Webflow Component Wrapper
 * Blog CTA card for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import BlogCTA from '@/components/webcn/landing_page/webcn.webflow.io/BlogCTA';
import '@/lib/styles/globals.css';

export function BlogCTAWrapper() {
  return <BlogCTA />;
}

export default declareComponent(BlogCTAWrapper, {
  name: 'webcn Blog CTA',
  description: 'Call-to-action card linking to technical blog post',
  group: 'webcn Landing',
  props: {},
});
