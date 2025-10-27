/**
 * RegistrationForm Webflow Component Wrapper
 * Wraps the RegistrationForm component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import RegistrationForm from '@/components/RegistrationForm';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

interface RegistrationFormWebflowProps {
  redirectTo: string;
  showGoogleAuth: boolean;
}

function RegistrationFormWrapper({ redirectTo, showGoogleAuth }: RegistrationFormWebflowProps) {
  // Note: showGoogleAuth prop is available for future use
  // Currently, Google OAuth visibility is controlled by NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED env var
  return (
    <WebflowProvidersWrapper>
      <RegistrationForm redirectTo={redirectTo} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(RegistrationFormWrapper, {
  name: 'Registration Form',
  description: 'User registration form with Better Auth integration',
  group: 'Authentication',
  props: {
    redirectTo: props.Text({
      name: 'Redirect To',
      defaultValue: '/dashboard',
      tooltip: 'URL to redirect to after successful registration',
    }),
    showGoogleAuth: props.Boolean({
      name: 'Show Google Auth',
      defaultValue: true,
      tooltip: 'Display Google OAuth sign-in button (requires NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED environment variable)',
    }),
  },
});
