/**
 * Footer Webflow Component Wrapper
 * Footer for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Footer, { type FooterProps } from '@/components/webcn/landing_page/webcn.webflow.io/Footer';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function FooterWrapper({
  brandText,
  brandSubtext,
  builderName,
  builderUrl,
  hackathonText,
  githubUrl,
  twitterUrl,
}: FooterProps) {
  return (
    <WebflowProvidersWrapper>
      <Footer
        brandText={brandText}
        brandSubtext={brandSubtext}
        builderName={builderName}
        builderUrl={builderUrl}
        hackathonText={hackathonText}
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
    builderName: props.Text({
      name: 'Builder Name',
      defaultValue: 'UZO LAB',
      tooltip: 'Name of the builder/creator to display in footer',
    }),
    builderUrl: props.Text({
      name: 'Builder URL',
      defaultValue: 'https://uzolab-template.webflow.io',
      tooltip: 'URL to link to the builder/creator website',
    }),
    hackathonText: props.Text({
      name: 'Hackathon Text',
      defaultValue: 'for Webflow x Contra Hackathon',
      tooltip: 'Text displayed on second line of footer credits',
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
