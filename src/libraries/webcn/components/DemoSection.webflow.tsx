/**
 * DemoSection Webflow Component Wrapper
 * Demo section showcasing blogflow for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import DemoSection, { type DemoSectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/DemoSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function DemoSectionWrapper({
  badgeText,
  sectionTitle,
  sectionSubtitle,
  demoTitle,
  demoDescription,
  ctaButtonText,
  showBadge,
}: DemoSectionProps) {
  return (
    <WebflowProvidersWrapper>
      <DemoSection
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        demoTitle={demoTitle}
        demoDescription={demoDescription}
        ctaButtonText={ctaButtonText}
        showBadge={showBadge}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(DemoSectionWrapper, {
  name: 'webcn Demo Section',
  description: 'Demo section showcasing the blogflow full-stack application',
  group: 'webcn Landing',
  props: {
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Live Demo',
      tooltip: 'Text displayed in the badge',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'See It In Action',
      tooltip: 'Main heading for the demo section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'blogflow: A full-stack collaborative blog built entirely with webcn components',
      tooltip: 'Subtitle text below the section heading',
    }),
    demoTitle: props.Text({
      name: 'Demo Title',
      defaultValue: 'blogflow',
      tooltip: 'Title of the demo application',
    }),
    demoDescription: props.Text({
      name: 'Demo Description',
      defaultValue: 'A fully functional blogging platform showcasing the power of webcn. Users can register, authenticate, create posts, and collaborate — all running natively within Webflow using code components.',
      tooltip: 'Description of the demo application',
    }),
    ctaButtonText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'Try blogflow Demo',
      tooltip: 'Text for the call-to-action button',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle visibility of the badge',
    }),
  },
});
