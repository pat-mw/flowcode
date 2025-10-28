/**
 * LoginForm Webflow Component Wrapper
 * Wraps the LoginForm component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import LoginForm from '@/components/LoginForm';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface LoginFormWebflowProps {
  redirectTo: string;
  showGoogleAuth: boolean;
}

export function LoginFormWrapper({ redirectTo }: LoginFormWebflowProps) {
  // Note: showGoogleAuth prop is available in the component definition
  // but currently Google OAuth visibility is controlled by NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED env var
  return (
    <WebflowProvidersWrapper>
      <LoginForm redirectTo={redirectTo} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(LoginFormWrapper, {
  name: 'Login Form',
  description: 'User authentication login form with Better Auth integration',
  group: 'Authentication',
  props: {
    redirectTo: props.Text({
      name: 'Redirect To',
      defaultValue: '/dashboard',
      tooltip: 'URL to redirect to after successful login',
    }),
    showGoogleAuth: props.Boolean({
      name: 'Show Google Auth',
      defaultValue: true,
      tooltip: 'Display Google OAuth sign-in button (requires NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED environment variable)',
    }),
  },
});
