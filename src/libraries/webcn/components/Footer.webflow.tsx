/**
 * Footer Webflow Component Wrapper
 * Footer for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Footer, { type FooterProps } from '@/components/webcn/landing_page/webcn.webflow.io/Footer';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function FooterWrapper({
  brandText,
  brandSubtext,
  copyrightText,
  githubUrl,
  twitterUrl,
}: FooterProps) {
  return (
    <WebflowProvidersWrapper>
      <Footer
        brandText={brandText}
        brandSubtext={brandSubtext}
        copyrightText={copyrightText}
        githubUrl={githubUrl}
        twitterUrl={twitterUrl}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(FooterWrapper, {
  name: 'webcn Footer',
  description: 'Footer section with brand, links, and social icons',
  group: 'webcn Landing',
  props: {
    brandText: props.Text({
      name: 'Brand Text',
      defaultValue: 'webcn',
      tooltip: 'Brand name displayed in the footer',
    }),
    brandSubtext: props.Text({
      name: 'Brand Subtext',
      defaultValue: 'Full-stack React components for Webflow',
      tooltip: 'Description text below the brand name',
    }),
    copyrightText: props.Text({
      name: 'Copyright Text',
      defaultValue: '© 2025 webcn. Built for Webflow × Contra Hackathon.',
      tooltip: 'Copyright notice displayed at the bottom',
    }),
    githubUrl: props.Text({
      name: 'GitHub URL',
      defaultValue: 'https://github.com',
      tooltip: 'URL for the GitHub link',
    }),
    twitterUrl: props.Text({
      name: 'Twitter URL',
      defaultValue: 'https://twitter.com',
      tooltip: 'URL for the Twitter link',
    }),
  },
});
