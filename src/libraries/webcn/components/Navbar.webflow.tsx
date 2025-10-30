/**
 * Navbar Webflow Component Wrapper
 * Navigation bar for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import Navbar from '@/components/webcn/landing_page/webcn.webflow.io/Navbar';
import '@/lib/styles/globals.css';

export function NavbarWrapper() {
  return <Navbar />;
}

export default declareComponent(NavbarWrapper, {
  name: 'webcn Navbar',
  description: 'Fixed navigation bar with logo, links, and GitHub button',
  group: 'webcn Landing',
  props: {},
});
