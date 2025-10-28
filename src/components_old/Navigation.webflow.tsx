import Navigation from '@/components/Navigation';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import {NavigationProps} from '@/components/Navigation';


export function NavigationWrapper(props: NavigationProps) {
  return (
    <WebflowProvidersWrapper>
      <Navigation
        {...props}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(Navigation, {
  name: 'Navigation',
  description: 'A responsive navigation bar with authentication state management',
  group: 'Layout',
  props: {
    brandName: props.Text({
      name: 'Brand Name',
      defaultValue: 'BlogFlow',
      tooltip: 'The name of your brand or site',
    }),
    brandLogo: props.Text({
      name: 'Brand Logo URL',
      defaultValue: '',
      tooltip: 'Optional URL to your logo image',
    }),
    homeUrl: props.Text({
      name: 'Home URL',
      defaultValue: '/',
      tooltip: 'URL for the home/brand link',
    }),
    showAuthButtons: props.Boolean({
      name: 'Show Auth Buttons',
      defaultValue: true,
      tooltip: 'Show login/logout buttons',
    }),
    loginUrl: props.Text({
      name: 'Login URL',
      defaultValue: '/login',
      tooltip: 'URL for the login page',
    }),
    registerUrl: props.Text({
      name: 'Register URL',
      defaultValue: '/register',
      tooltip: 'URL for the registration page',
    }),
    variant: props.Variant({
      name: 'Variant',
      options: ['default', 'minimal', 'centered'],
      defaultValue: 'default',
      tooltip: 'Navigation layout style',
    }),
  },
});
