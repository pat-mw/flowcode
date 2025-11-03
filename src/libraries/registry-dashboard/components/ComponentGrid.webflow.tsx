/**
 * ComponentGrid Webflow Component Wrapper
 * Grid of all available components organized by library
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentGrid, { type ComponentGridProps } from '@/components/registry-dashboard/ComponentGrid';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentGridWrapper({
  sectionTitle,
  sectionSubtitle,
  viewAllButtonText,
  basePath,
}: ComponentGridProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentGrid
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        viewAllButtonText={viewAllButtonText}
        basePath={basePath}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentGridWrapper, {
  name: 'Component Grid',
  description: 'Grid showcasing all available components organized by library',
  group: 'Registry Dashboard',
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
      tooltip: 'Text for the view all components button (currently unused)',
    }),
    basePath: props.Text({
      name: 'Component Detail Base Path',
      defaultValue: '/lander/webcn/component',
      tooltip: 'Base URL path for component detail pages. Component ID will be appended as ?id=',
    }),
  },
});
