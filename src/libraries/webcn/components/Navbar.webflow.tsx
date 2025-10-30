/**
 * Navbar Webflow Component Wrapper
 * Navigation bar for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Navbar, { type NavbarProps } from '@/components/webcn/landing_page/webcn.webflow.io/Navbar';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function NavbarWrapper({
  logoText,
  githubUrl,
  ctaButtonText,
  showGithubLink,
}: NavbarProps) {
  return (
    <WebflowProvidersWrapper>
      <Navbar
        logoText={logoText}
        githubUrl={githubUrl}
        ctaButtonText={ctaButtonText}
        showGithubLink={showGithubLink}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(NavbarWrapper, {
  name: 'webcn Navbar',
  description: 'Fixed navigation bar with logo, links, and GitHub button',
  group: 'webcn Landing',
  props: {
    logoText: props.Text({
      name: 'Logo Text',
      defaultValue: 'webcn',
      tooltip: 'Text displayed in the logo',
    }),
    githubUrl: props.Text({
      name: 'GitHub URL',
      defaultValue: 'https://github.com',
      tooltip: 'URL for the GitHub link',
    }),
    ctaButtonText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'Get Started',
      tooltip: 'Text for the call-to-action button',
    }),
    showGithubLink: props.Boolean({
      name: 'Show GitHub Link',
      defaultValue: true,
      tooltip: 'Toggle visibility of the GitHub icon link',
    }),
  },
});
