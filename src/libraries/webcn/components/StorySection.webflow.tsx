/**
 * StorySection Webflow Component Wrapper
 * Story section about the hackathon for webcn landing page
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import StorySection, { type StorySectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/StorySection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function StorySectionWrapper({
  sectionTitle,
  sectionSubtitle,
  feature1Title,
  feature1Description,
  feature2Title,
  feature2Description,
  feature3Title,
  feature3Description,
}: StorySectionProps) {
  return (
    <WebflowProvidersWrapper>
      <StorySection
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        feature1Title={feature1Title}
        feature1Description={feature1Description}
        feature2Title={feature2Title}
        feature2Description={feature2Description}
        feature3Title={feature3Title}
        feature3Description={feature3Description}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(StorySectionWrapper, {
  name: 'webcn Story Section',
  description: 'Story section explaining the hackathon challenge, vision, and impact',
  group: 'webcn Landing',
  props: {
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'The Hackathon Story',
      tooltip: 'Main heading for the story section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Why we\'re building a framework instead of "just another website"',
      tooltip: 'Subtitle text below the section heading',
    }),
    feature1Title: props.Text({
      name: 'Feature 1 Title',
      defaultValue: 'The Challenge',
      tooltip: 'Title for the first feature (Challenge)',
    }),
    feature1Description: props.Text({
      name: 'Feature 1 Description',
      defaultValue: "Webflow's new Code Components feature unlocked something powerful: the ability to bring React's ecosystem into Webflow. But nobody had built the infrastructure to make it truly useful.",
      tooltip: 'Description text for the first feature',
    }),
    feature2Title: props.Text({
      name: 'Feature 2 Title',
      defaultValue: 'The Vision',
      tooltip: 'Title for the second feature (Vision)',
    }),
    feature2Description: props.Text({
      name: 'Feature 2 Description',
      defaultValue: "Instead of a traditional landing page submission, we're shipping a complete full-stack framework. Real authentication, databases, and server logic—all running natively in Webflow.",
      tooltip: 'Description text for the second feature',
    }),
    feature3Title: props.Text({
      name: 'Feature 3 Title',
      defaultValue: 'The Impact',
      tooltip: 'Title for the third feature (Impact)',
    }),
    feature3Description: props.Text({
      name: 'Feature 3 Description',
      defaultValue: "webcn isn't just for this hackathon. It's a foundation for developers to build production-ready apps in Webflow, pushing the platform beyond its traditional boundaries.",
      tooltip: 'Description text for the third feature',
    }),
  },
});
