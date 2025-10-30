/**
 * Features Webflow Component Wrapper
 * Features grid section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import Features from '@/components/webcn/landing_page/webcn.webflow.io/Features';
import '@/lib/styles/globals.css';

export function FeaturesWrapper() {
  return <Features />;
}

export default declareComponent(FeaturesWrapper, {
  name: 'webcn Features',
  description: 'Feature grid showcasing key features with icons and descriptions',
  group: 'webcn Landing',
  props: {},
});
