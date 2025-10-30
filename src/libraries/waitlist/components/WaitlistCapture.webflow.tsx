/**
 * WaitlistCapture Webflow Component Wrapper
 * Captures email signups for waitlist with optional name and company fields
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import WaitlistCapture, { type WaitlistCaptureProps } from '@/components/waitlist/WaitlistCapture';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function WaitlistCaptureWrapper({
  title,
  subtitle,
  buttonText,
  successMessage,
  showNameField,
  showCompanyField,
  referralSource,
  placeholderEmail,
  placeholderName,
  placeholderCompany,
}: WaitlistCaptureProps) {
  return (
    <WebflowProvidersWrapper>
      <WaitlistCapture
        title={title}
        subtitle={subtitle}
        buttonText={buttonText}
        successMessage={successMessage}
        showNameField={showNameField}
        showCompanyField={showCompanyField}
        referralSource={referralSource}
        placeholderEmail={placeholderEmail}
        placeholderName={placeholderName}
        placeholderCompany={placeholderCompany}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(WaitlistCaptureWrapper, {
  name: 'Waitlist Capture',
  description: 'Email capture form for waitlist signups with optional name and company fields',
  group: 'Waitlist',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Join the Waitlist',
      tooltip: 'Main heading for the waitlist form',
    }),
    subtitle: props.Text({
      name: 'Subtitle',
      defaultValue: 'Be the first to know when we launch. Get exclusive early access.',
      tooltip: 'Subtitle text below the heading',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Join Waitlist',
      tooltip: 'Text displayed on the submit button',
    }),
    successMessage: props.Text({
      name: 'Success Message',
      defaultValue: "You're on the list! We'll be in touch soon.",
      tooltip: 'Message shown after successful signup',
    }),
    showNameField: props.Boolean({
      name: 'Show Name Field',
      defaultValue: true,
      tooltip: 'Display optional name input field',
    }),
    showCompanyField: props.Boolean({
      name: 'Show Company Field',
      defaultValue: false,
      tooltip: 'Display optional company input field',
    }),
    referralSource: props.Text({
      name: 'Referral Source',
      defaultValue: '',
      tooltip: 'Track where signups came from (e.g., "landing-page", "blog")',
    }),
    placeholderEmail: props.Text({
      name: 'Email Placeholder',
      defaultValue: 'Enter your email',
      tooltip: 'Placeholder text for email field',
    }),
    placeholderName: props.Text({
      name: 'Name Placeholder',
      defaultValue: 'Your name',
      tooltip: 'Placeholder text for name field',
    }),
    placeholderCompany: props.Text({
      name: 'Company Placeholder',
      defaultValue: 'Company name',
      tooltip: 'Placeholder text for company field',
    }),
  },
});
