/**
 * ComponentGrid Webflow Component Wrapper
 * Grid of available components for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentGrid, { type ComponentGridProps } from '@/components/webcn/landing_page/webcn.webflow.io/ComponentGrid';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function ComponentGridWrapper({
  sectionTitle,
  sectionSubtitle,
  viewAllButtonText,
}: ComponentGridProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentGrid
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        viewAllButtonText={viewAllButtonText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentGridWrapper, {
  name: 'webcn Component Grid',
  description: 'Grid showcasing available components with categories and previews',
  group: 'webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Component Library',
      tooltip: 'Main heading for the component grid section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Explore our growing collection of production-ready components',
      tooltip: 'Subtitle text below the section heading',
    }),
    viewAllButtonText: props.Text({
      name: 'View All Button Text',
      defaultValue: 'View All Components',
      tooltip: 'Text for the view all components button',
    }),
  },
});
