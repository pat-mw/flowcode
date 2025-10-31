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
  primaryCtaUrl,
  secondaryCtaText,
  secondaryCtaUrl,
  showBadge,
  showTechStack,
  showBackground,
  hueShift,
  noiseIntensity,
  scanlineIntensity,
  speed,
  scanlineFrequency,
  warpAmount,
  resolutionScale,
}: HeroProps) {
  return (
    <WebflowProvidersWrapper>
      <Hero
        badgeText={badgeText}
        title={title}
        subtitle={subtitle}
        description={description}
        primaryCtaText={primaryCtaText}
        primaryCtaUrl={primaryCtaUrl}
        secondaryCtaText={secondaryCtaText}
        secondaryCtaUrl={secondaryCtaUrl}
        showBadge={showBadge}
        showTechStack={showTechStack}
        showBackground={showBackground}
        hueShift={hueShift}
        noiseIntensity={noiseIntensity}
        scanlineIntensity={scanlineIntensity}
        speed={speed}
        scanlineFrequency={scanlineFrequency}
        warpAmount={warpAmount}
        resolutionScale={resolutionScale}
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
    primaryCtaUrl: props.Text({
      name: 'Primary CTA URL',
      defaultValue: '#components',
      tooltip: 'URL or anchor link for primary button (e.g., #components, /page, https://...)',
    }),
    secondaryCtaText: props.Text({
      name: 'Secondary CTA Text',
      defaultValue: 'View Demo',
      tooltip: 'Text for the secondary call-to-action button',
    }),
    secondaryCtaUrl: props.Text({
      name: 'Secondary CTA URL',
      defaultValue: '#demo',
      tooltip: 'URL or anchor link for secondary button (e.g., #demo, /page, https://...)',
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
    showBackground: props.Boolean({
      name: 'Show Animated Background',
      defaultValue: true,
      tooltip: 'Toggle the DarkVeil animated background effect',
    }),
    hueShift: props.Number({
      name: 'Hue Shift',
      defaultValue: 100,
      tooltip: 'Adjust the color hue of the background (0-360 degrees)',
    }),
    noiseIntensity: props.Number({
      name: 'Noise Intensity',
      defaultValue: 0.2,
      tooltip: 'Amount of visual noise/grain effect (0-1)',
    }),
    scanlineIntensity: props.Number({
      name: 'Scanline Intensity',
      defaultValue: 0.4,
      tooltip: 'Strength of scanline effect (0-1)',
    }),
    speed: props.Number({
      name: 'Animation Speed',
      defaultValue: 1.2,
      tooltip: 'Speed of the background animation (0-5)',
    }),
    scanlineFrequency: props.Number({
      name: 'Scanline Frequency',
      defaultValue: 0.6,
      tooltip: 'Frequency/density of scanlines (0-2)',
    }),
    warpAmount: props.Number({
      name: 'Warp Amount',
      defaultValue: 0.4,
      tooltip: 'Amount of warping/distortion effect (0-1)',
    }),
    resolutionScale: props.Number({
      name: 'Resolution Scale',
      defaultValue: 1,
      tooltip: 'Rendering resolution (0.5-2, lower = better performance)',
    }),
  },
});
