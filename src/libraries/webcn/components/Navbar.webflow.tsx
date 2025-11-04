/**
 * Navbar Webflow Component Wrapper
 * Navigation bar for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props, PropType, PropValues } from '@webflow/data-types';
import Navbar, { type NavbarProps } from '@/components/webcn/landing_page/webcn.webflow.io/Navbar';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

// Webflow props type with Link instead of string for logoLink
type WebflowNavbarProps = {
  logoLink?: PropValues[PropType.Link];
} & Omit<NavbarProps, 'logoLink'>;

export function NavbarWrapper({
  logoText,
  logoLink,
  githubUrl,
  ctaButtonText,
  ctaButtonUrl,
  showGithubLink,
  link1Label,
  link1Url,
  showLink1,
  link2Label,
  link2Url,
  showLink2,
  link3Label,
  link3Url,
  showLink3,
  link4Label,
  link4Url,
  showLink4,
}: WebflowNavbarProps) {
  return (
    <WebflowProvidersWrapper>
      <Navbar
        logoText={logoText}
        logoLink={logoLink}
        githubUrl={githubUrl}
        ctaButtonText={ctaButtonText}
        ctaButtonUrl={ctaButtonUrl}
        showGithubLink={showGithubLink}
        link1Label={link1Label}
        link1Url={link1Url}
        showLink1={showLink1}
        link2Label={link2Label}
        link2Url={link2Url}
        showLink2={showLink2}
        link3Label={link3Label}
        link3Url={link3Url}
        showLink3={showLink3}
        link4Label={link4Label}
        link4Url={link4Url}
        showLink4={showLink4}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(NavbarWrapper, {
  name: 'webcn Navbar',
  description: 'Fixed navigation bar with logo, configurable links, and GitHub button',
  group: 'webcn Landing',
  props: {
    logoText: props.Text({
      name: 'Logo Text',
      defaultValue: 'webcn',
      tooltip: 'Text displayed in the logo',
    }),
    logoLink: props.Link({
      name: 'Logo Link',
      tooltip: 'Link for the logo (includes URL, target, and preload options). Defaults to "/".',
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
    ctaButtonUrl: props.Text({
      name: 'CTA Button URL',
      defaultValue: '#get-started',
      tooltip: 'URL for the call-to-action button',
    }),
    showGithubLink: props.Boolean({
      name: 'Show GitHub Link',
      defaultValue: true,
      tooltip: 'Toggle visibility of the GitHub icon link',
    }),
    // Navigation Link 1
    link1Label: props.Text({
      name: 'Link 1 Label',
      defaultValue: 'Features',
      tooltip: 'Text for the first navigation link',
    }),
    link1Url: props.Text({
      name: 'Link 1 URL',
      defaultValue: '#features',
      tooltip: 'URL for the first navigation link',
    }),
    showLink1: props.Boolean({
      name: 'Show Link 1',
      defaultValue: true,
      tooltip: 'Toggle visibility of the first navigation link',
    }),
    // Navigation Link 2
    link2Label: props.Text({
      name: 'Link 2 Label',
      defaultValue: 'Components',
      tooltip: 'Text for the second navigation link',
    }),
    link2Url: props.Text({
      name: 'Link 2 URL',
      defaultValue: '#components',
      tooltip: 'URL for the second navigation link',
    }),
    showLink2: props.Boolean({
      name: 'Show Link 2',
      defaultValue: true,
      tooltip: 'Toggle visibility of the second navigation link',
    }),
    // Navigation Link 3
    link3Label: props.Text({
      name: 'Link 3 Label',
      defaultValue: 'Demo',
      tooltip: 'Text for the third navigation link',
    }),
    link3Url: props.Text({
      name: 'Link 3 URL',
      defaultValue: '#demo',
      tooltip: 'URL for the third navigation link',
    }),
    showLink3: props.Boolean({
      name: 'Show Link 3',
      defaultValue: true,
      tooltip: 'Toggle visibility of the third navigation link',
    }),
    // Navigation Link 4
    link4Label: props.Text({
      name: 'Link 4 Label',
      defaultValue: 'Story',
      tooltip: 'Text for the fourth navigation link',
    }),
    link4Url: props.Text({
      name: 'Link 4 URL',
      defaultValue: '#story',
      tooltip: 'URL for the fourth navigation link',
    }),
    showLink4: props.Boolean({
      name: 'Show Link 4',
      defaultValue: true,
      tooltip: 'Toggle visibility of the fourth navigation link',
    }),
  },
});
