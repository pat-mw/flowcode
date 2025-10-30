/**
 * Footer Webflow Component Wrapper
 * Footer for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import Footer from '@/components/webcn/landing_page/webcn.webflow.io/Footer';
import '@/lib/styles/globals.css';

export function FooterWrapper() {
  return <Footer />;
}

export default declareComponent(FooterWrapper, {
  name: 'webcn Footer',
  description: 'Footer section with brand, links, and social icons',
  group: 'webcn Landing',
  props: {},
});
