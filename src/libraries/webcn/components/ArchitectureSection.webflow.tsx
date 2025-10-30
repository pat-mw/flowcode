/**
 * ArchitectureSection Webflow Component Wrapper
 * Animated diagram showing full-stack architecture flow
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ArchitectureSection, { type ArchitectureSectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/ArchitectureSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function ArchitectureSectionWrapper({
  badgeText,
  sectionTitle,
  sectionSubtitle,
  showBadge,
}: ArchitectureSectionProps) {
  return (
    <WebflowProvidersWrapper>
      <ArchitectureSection
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        showBadge={showBadge}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ArchitectureSectionWrapper, {
  name: 'webcn Architecture',
  description: 'Animated diagram showing the full-stack architecture from Webflow to database',
  group: 'webcn Landing',
  props: {
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Architecture',
      tooltip: 'Text displayed in the badge above the section title',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Enterprise-Grade Full-Stack Architecture',
      tooltip: 'Main heading for the section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'From Webflow to database, built with security and scalability in mind',
      tooltip: 'Subtitle text below the section heading',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle the badge visibility above the section title',
    }),
  },
});
