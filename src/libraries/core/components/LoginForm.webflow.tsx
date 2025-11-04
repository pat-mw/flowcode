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
  title: string;
  description: string;
}

export function LoginFormWrapper({
  redirectTo,
  showGoogleAuth,
  title,
  description
}: LoginFormWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <LoginForm
        redirectTo={redirectTo}
        showGoogleAuth={showGoogleAuth}
        title={title}
        description={description}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(LoginFormWrapper, {
  name: 'Login Form',
  description: 'User authentication login form with Better Auth integration',
  group: 'Authentication',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Login to BlogFlow',
      tooltip: 'Form title text',
    }),
    description: props.Text({
      name: 'Description',
      defaultValue: 'Enter your credentials to access your account',
      tooltip: 'Form description text',
    }),
    redirectTo: props.Text({
      name: 'Redirect To',
      defaultValue: '/dashboard',
      tooltip: 'URL to redirect to after successful login',
    }),
    showGoogleAuth: props.Boolean({
      name: 'Show Google Auth',
      defaultValue: true,
      tooltip: 'Display Google OAuth sign-in button and divider',
    }),
  },
});
