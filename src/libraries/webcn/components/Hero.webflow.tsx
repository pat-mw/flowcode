/**
 * Hero Webflow Component Wrapper
 * Main hero section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Hero, { type HeroProps } from '@/components/webcn/landing_page/webcn.webflow.io/Hero';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function HeroWrapper({
  badgeText,
  title,
  subtitle,
  description,
  primaryCtaText,
  secondaryCtaText,
  showBadge,
  showTechStack,
}: HeroProps) {
  return (
    <WebflowProvidersWrapper>
      <Hero
        badgeText={badgeText}
        title={title}
        subtitle={subtitle}
        description={description}
        primaryCtaText={primaryCtaText}
        secondaryCtaText={secondaryCtaText}
        showBadge={showBadge}
        showTechStack={showTechStack}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(HeroWrapper, {
  name: 'webcn Hero',
  description: 'Hero section with gradient backgrounds, badge, and CTA buttons',
  group: 'webcn Landing',
  props: {
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Webflow × Contra Hackathon Entry',
      tooltip: 'Text displayed in the top badge',
    }),
    title: props.Text({
      name: 'Title',
      defaultValue: 'webcn',
      tooltip: 'Main heading text',
    }),
    subtitle: props.Text({
      name: 'Subtitle',
      defaultValue: 'Full-stack React components for Webflow',
      tooltip: 'Subtitle text below the main title',
    }),
    description: props.Text({
      name: 'Description',
      defaultValue: "Leverage Webflow's new code components feature to build production-ready applications. Drop in authentication, databases, and complex UI — all running natively in Webflow.",
      tooltip: 'Detailed description text',
    }),
    primaryCtaText: props.Text({
      name: 'Primary CTA Text',
      defaultValue: 'Browse Components',
      tooltip: 'Text for the primary call-to-action button',
    }),
    secondaryCtaText: props.Text({
      name: 'Secondary CTA Text',
      defaultValue: 'View Demo',
      tooltip: 'Text for the secondary call-to-action button',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle visibility of the top badge',
    }),
    showTechStack: props.Boolean({
      name: 'Show Tech Stack',
      defaultValue: true,
      tooltip: 'Toggle visibility of the technology stack section',
    }),
  },
});
