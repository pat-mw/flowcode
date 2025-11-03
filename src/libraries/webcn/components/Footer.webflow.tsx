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
  componentsLink,
  componentsLabel,
  demoLink,
  demoLabel,
  storyLink,
  storyLabel,
  githubLinkLabel,
  showGithubIcon,
  showTwitterIcon,
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
        componentsLink={componentsLink}
        componentsLabel={componentsLabel}
        demoLink={demoLink}
        demoLabel={demoLabel}
        storyLink={storyLink}
        storyLabel={storyLabel}
        githubLinkLabel={githubLinkLabel}
        showGithubIcon={showGithubIcon}
        showTwitterIcon={showTwitterIcon}
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
    componentsLink: props.Text({
      name: 'Components Link',
      defaultValue: '#components',
      tooltip: 'URL for the Components navigation link',
    }),
    componentsLabel: props.Text({
      name: 'Components Label',
      defaultValue: 'Components',
      tooltip: 'Text label for the Components link',
    }),
    demoLink: props.Text({
      name: 'Demo Link',
      defaultValue: '#demo',
      tooltip: 'URL for the Demo navigation link',
    }),
    demoLabel: props.Text({
      name: 'Demo Label',
      defaultValue: 'Demo',
      tooltip: 'Text label for the Demo link',
    }),
    storyLink: props.Text({
      name: 'Story Link',
      defaultValue: '#story',
      tooltip: 'URL for the Story navigation link',
    }),
    storyLabel: props.Text({
      name: 'Story Label',
      defaultValue: 'Story',
      tooltip: 'Text label for the Story link',
    }),
    githubLinkLabel: props.Text({
      name: 'GitHub Link Label',
      defaultValue: 'GitHub',
      tooltip: 'Text label for the GitHub navigation link',
    }),
    showGithubIcon: props.Visibility({
      name: 'Show GitHub Icon',
      defaultValue: true,
      tooltip: 'Toggle visibility of the GitHub social icon',
    }),
    showTwitterIcon: props.Visibility({
      name: 'Show Twitter Icon',
      defaultValue: false,
      tooltip: 'Toggle visibility of the Twitter social icon',
    }),
  },
});
