/**
 * BlogCTA Webflow Component Wrapper
 * Blog CTA card for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import BlogCTA, { type BlogCTAProps } from '@/components/webcn/landing_page/webcn.webflow.io/BlogCTA';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function BlogCTAWrapper({ title, description, buttonText }: BlogCTAProps) {
  return (
    <WebflowProvidersWrapper>
      <BlogCTA title={title} description={description} buttonText={buttonText} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(BlogCTAWrapper, {
  name: 'webcn Blog CTA',
  description: 'Call-to-action card linking to technical blog post',
  group: 'webcn Landing',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Deep Dive: Building Full-Stack Webflow Apps',
      tooltip: 'Main heading for the CTA card',
    }),
    description: props.Text({
      name: 'Description',
      defaultValue: "Read our technical breakdown of how webcn brings React's full ecosystem to Webflow, complete with authentication, databases, and more.",
      tooltip: 'Description text for the CTA',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Read the Blog Post',
      tooltip: 'Text for the CTA button',
    }),
  },
});
