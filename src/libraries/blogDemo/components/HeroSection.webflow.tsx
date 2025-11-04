/**
 * Hero Section Webflow Component Wrapper
 * Landing page hero section with auth-aware CTAs
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import HeroSection from '@/components/HeroSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface HeroSectionWebflowProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonUrl: string;
  showFeatures: boolean;
  showBlogCTA: boolean;
}

export function HeroSectionWrapper({
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonUrl,
  secondaryButtonUrl,
  showFeatures,
  showBlogCTA,
}: HeroSectionWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <HeroSection
        title={title}
        subtitle={subtitle}
        primaryButtonText={primaryButtonText}
        secondaryButtonText={secondaryButtonText}
        primaryButtonUrl={primaryButtonUrl}
        secondaryButtonUrl={secondaryButtonUrl}
        showFeatures={showFeatures}
        showBlogCTA={showBlogCTA}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(HeroSectionWrapper, {
  name: 'Hero Section',
  description: 'Landing page hero section with title, subtitle, CTAs, and feature cards',
  group: 'BlogFlow Demo',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Welcome to BlogFlow',
      tooltip: 'Main hero heading',
    }),
    subtitle: props.Text({
      name: 'Subtitle',
      defaultValue: 'A modern blogging platform built with Next.js and Webflow',
      tooltip: 'Hero subtitle text',
    }),
    primaryButtonText: props.Text({
      name: 'Primary Button Text',
      defaultValue: '',
      tooltip: 'Leave empty to auto-detect based on auth state (Dashboard/Get Started)',
    }),
    secondaryButtonText: props.Text({
      name: 'Secondary Button Text',
      defaultValue: '',
      tooltip: 'Leave empty to auto-detect based on auth state (View Blog/Login)',
    }),
    primaryButtonUrl: props.Text({
      name: 'Primary Button URL',
      defaultValue: '',
      tooltip: 'Leave empty to auto-detect based on auth state (/dashboard or /register)',
    }),
    secondaryButtonUrl: props.Text({
      name: 'Secondary Button URL',
      defaultValue: '',
      tooltip: 'Leave empty to auto-detect based on auth state (/blog or /login)',
    }),
    showFeatures: props.Boolean({
      name: 'Show Features',
      defaultValue: true,
      tooltip: 'Show the three feature cards',
    }),
    showBlogCTA: props.Boolean({
      name: 'Show Blog CTA',
      defaultValue: true,
      tooltip: 'Show the bottom blog browse call-to-action',
    }),
  },
});
