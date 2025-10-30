/**
 * DemoSection Webflow Component Wrapper
 * Demo section showcasing blogflow for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import DemoSection from '@/components/webcn/landing_page/webcn.webflow.io/DemoSection';
import '@/lib/styles/globals.css';

export function DemoSectionWrapper() {
  return <DemoSection />;
}

export default declareComponent(DemoSectionWrapper, {
  name: 'webcn Demo Section',
  description: 'Demo section showcasing the blogflow full-stack application',
  group: 'webcn Landing',
  props: {},
});
