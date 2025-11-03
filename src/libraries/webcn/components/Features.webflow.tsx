/**
 * Features Webflow Component Wrapper
 * Features grid section for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Features, { type FeaturesProps } from '@/components/webcn/landing_page/webcn.webflow.io/Features';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function FeaturesWrapper(props: FeaturesProps) {
  return (
    <WebflowProvidersWrapper>
      <Features {...props} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(FeaturesWrapper, {
  name: 'webcn Features',
  description: 'Feature grid showcasing key features with icons and descriptions. Leave feature titles empty to hide them.',
  group: 'webcn Landing',
  props: {
    // Section-level props
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'More Than Just Components',
      tooltip: 'Main heading for the features section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'A complete framework for building production applications in Webflow',
      tooltip: 'Subtitle text below the section heading',
    }),

    // Feature 1 (shadcn/ui Ready)
    feature1Title: props.Text({
      name: 'Feature 1 Title',
      defaultValue: 'shadcn/ui Ready',
      tooltip: 'Title for first feature card. Leave empty to hide this card.',
    }),
    feature1Description: props.Text({
      name: 'Feature 1 Description',
      defaultValue: 'All your favorite shadcn components, optimized and ready to drop into Webflow projects.',
      tooltip: 'Description for first feature card',
    }),

    // Feature 2 (Full-Stack Components)
    feature2Title: props.Text({
      name: 'Feature 2 Title',
      defaultValue: 'Full-Stack Components',
      tooltip: 'Title for second feature card. Leave empty to hide this card.',
    }),
    feature2Description: props.Text({
      name: 'Feature 2 Description',
      defaultValue: 'Pre-built authentication, database connections, and API integrations that just work.',
      tooltip: 'Description for second feature card',
    }),

    // Feature 3 (Authentication Built-in)
    feature3Title: props.Text({
      name: 'Feature 3 Title',
      defaultValue: 'Authentication Built-in',
      tooltip: 'Title for third feature card. Leave empty to hide this card.',
    }),
    feature3Description: props.Text({
      name: 'Feature 3 Description',
      defaultValue: 'User registration, login, and session management with zero backend configuration.',
      tooltip: 'Description for third feature card',
    }),

    // Feature 4 (Zero Configuration)
    feature4Title: props.Text({
      name: 'Feature 4 Title',
      defaultValue: 'Zero Configuration',
      tooltip: 'Title for fourth feature card. Leave empty to hide this card.',
    }),
    feature4Description: props.Text({
      name: 'Feature 4 Description',
      defaultValue: 'Copy, paste, customize. No build process, no complex setup — just pure React components.',
      tooltip: 'Description for fourth feature card',
    }),

    // Feature 5 (Composable Architecture)
    feature5Title: props.Text({
      name: 'Feature 5 Title',
      defaultValue: 'Composable Architecture',
      tooltip: 'Title for fifth feature card. Leave empty to hide this card.',
    }),
    feature5Description: props.Text({
      name: 'Feature 5 Description',
      defaultValue: 'Mix and match components to build exactly what you need. From simple to complex.',
      tooltip: 'Description for fifth feature card',
    }),

    // Feature 6 (Native Webflow Integration)
    feature6Title: props.Text({
      name: 'Feature 6 Title',
      defaultValue: 'Native Webflow Integration',
      tooltip: 'Title for sixth feature card. Leave empty to hide this card.',
    }),
    feature6Description: props.Text({
      name: 'Feature 6 Description',
      defaultValue: "Designed specifically for Webflow's code components feature. Seamless integration guaranteed.",
      tooltip: 'Description for sixth feature card',
    }),
  },
});
