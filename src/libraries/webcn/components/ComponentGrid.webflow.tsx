/**
 * ComponentGrid Webflow Component Wrapper
 * Grid of available components for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import ComponentGrid from '@/components/webcn/landing_page/webcn.webflow.io/ComponentGrid';
import '@/lib/styles/globals.css';

export function ComponentGridWrapper() {
  return <ComponentGrid />;
}

export default declareComponent(ComponentGridWrapper, {
  name: 'webcn Component Grid',
  description: 'Grid showcasing available components with categories and previews',
  group: 'webcn Landing',
  props: {},
});
