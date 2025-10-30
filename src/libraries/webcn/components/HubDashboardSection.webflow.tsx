/**
 * HubDashboardSection Webflow Component Wrapper
 * Management dashboard for connecting services and installing libraries
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import HubDashboardSection, { type HubDashboardSectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/HubDashboardSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function HubDashboardSectionWrapper({
  badgeText,
  sectionTitle,
  sectionSubtitle,
  showBadge,
  hubTitle,
  projectName,
  statusText,
}: HubDashboardSectionProps) {
  return (
    <WebflowProvidersWrapper>
      <HubDashboardSection
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        showBadge={showBadge}
        hubTitle={hubTitle}
        projectName={projectName}
        statusText={statusText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(HubDashboardSectionWrapper, {
  name: 'webcn Hub Dashboard',
  description: 'Interactive dashboard preview for managing libraries and connecting services',
  group: 'webcn Landing',
  props: {
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Management Hub',
      tooltip: 'Text displayed in the badge above the section title',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Control Center for Your Stack',
      tooltip: 'Main heading for the section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Connect services, install libraries, and configure your backend — all from one dashboard',
      tooltip: 'Subtitle text below the section heading',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle the badge visibility above the section title',
    }),
    hubTitle: props.Text({
      name: 'Hub Title',
      defaultValue: 'webcn Hub',
      tooltip: 'Title displayed in the dashboard header',
    }),
    projectName: props.Text({
      name: 'Project Name',
      defaultValue: 'my-webflow-app',
      tooltip: 'Project name displayed in the dashboard header',
    }),
    statusText: props.Text({
      name: 'Status Text',
      defaultValue: 'Live',
      tooltip: 'Status text displayed in the badge (e.g., Live, Development, Staging)',
    }),
  },
});
