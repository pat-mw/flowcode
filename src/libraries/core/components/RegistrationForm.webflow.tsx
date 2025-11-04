/**
 * RegistrationForm Webflow Component Wrapper
 * Wraps the RegistrationForm component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import RegistrationForm from '@/components/RegistrationForm';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface RegistrationFormWebflowProps {
  redirectTo: string;
  showGoogleAuth: boolean;
  title: string;
  description: string;
}

export function RegistrationFormWrapper({
  redirectTo,
  showGoogleAuth,
  title,
  description
}: RegistrationFormWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <RegistrationForm
        redirectTo={redirectTo}
        showGoogleAuth={showGoogleAuth}
        title={title}
        description={description}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(RegistrationFormWrapper, {
  name: 'Registration Form',
  description: 'User registration form with Better Auth integration',
  group: 'Authentication',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Create your account',
      tooltip: 'Form title text',
    }),
    description: props.Text({
      name: 'Description',
      defaultValue: 'Sign up to get started with BlogFlow',
      tooltip: 'Form description text',
    }),
    redirectTo: props.Text({
      name: 'Redirect To',
      defaultValue: '/dashboard',
      tooltip: 'URL to redirect to after successful registration',
    }),
    showGoogleAuth: props.Boolean({
      name: 'Show Google Auth',
      defaultValue: true,
      tooltip: 'Display Google OAuth sign-in button and divider',
    }),
  },
});
