/**
 * WaitlistSection Webflow Component Wrapper
 * Imports and wraps the WaitlistCapture component from the waitlist library
 * Tests cross-library component imports in Webflow bundling
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import WaitlistSection, { type WaitlistSectionProps } from '@/components/webcn/landing_page/webcn.webflow.io/WaitlistSection';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function WaitlistSectionWrapper({
  badgeText,
  sectionTitle,
  sectionSubtitle,
  formTitle,
  formSubtitle,
  buttonText,
  successMessage,
  showNameField,
  showBadge,
}: WaitlistSectionProps) {
  return (
    <WebflowProvidersWrapper>
      <WaitlistSection
        badgeText={badgeText}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        formTitle={formTitle}
        formSubtitle={formSubtitle}
        buttonText={buttonText}
        successMessage={successMessage}
        showNameField={showNameField}
        showBadge={showBadge}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(WaitlistSectionWrapper, {
  name: 'webcn Waitlist',
  description: 'Waitlist capture section that imports from the waitlist library (tests cross-library bundling)',
  group: 'webcn Landing',
  props: {
    badgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'Join the Waitlist',
      tooltip: 'Text displayed in the badge above the section title',
    }),
    sectionTitle: props.Text({
      name: 'Section Title',
      defaultValue: 'Be Among the First',
      tooltip: 'Main heading for the waitlist section',
    }),
    sectionSubtitle: props.Text({
      name: 'Section Subtitle',
      defaultValue: 'Get early access to webcn and be part of the future of Webflow development',
      tooltip: 'Subtitle text below the section heading',
    }),
    formTitle: props.Text({
      name: 'Form Title',
      defaultValue: 'Reserve Your Spot',
      tooltip: 'Title for the waitlist form card',
    }),
    formSubtitle: props.Text({
      name: 'Form Subtitle',
      defaultValue: 'Join thousands of developers already on the list',
      tooltip: 'Subtitle for the waitlist form card',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Join Waitlist',
      tooltip: 'Text displayed on the submit button',
    }),
    successMessage: props.Text({
      name: 'Success Message',
      defaultValue: "🎉 You're in! We'll notify you when we launch.",
      tooltip: 'Message shown after successful signup',
    }),
    showNameField: props.Boolean({
      name: 'Show Name Field',
      defaultValue: true,
      tooltip: 'Display optional name input field',
    }),
    showBadge: props.Boolean({
      name: 'Show Badge',
      defaultValue: true,
      tooltip: 'Toggle the badge visibility above the section title',
    }),
  },
});
