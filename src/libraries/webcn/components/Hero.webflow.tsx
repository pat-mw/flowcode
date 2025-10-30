/**
 * Hero Webflow Component Wrapper
 * Main hero section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import Hero from '@/components/webcn/landing_page/webcn.webflow.io/Hero';
import '@/lib/styles/globals.css';

export function HeroWrapper() {
  return <Hero />;
}

export default declareComponent(HeroWrapper, {
  name: 'webcn Hero',
  description: 'Hero section with gradient backgrounds, badge, and CTA buttons',
  group: 'webcn Landing',
  props: {},
});
