/**
 * HelloUser Webflow Component Wrapper
 * Wraps the HelloUser component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import HelloUser, { HelloUserProps } from '@/components/HelloUser';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function HelloUserWrapper(props: HelloUserProps) {
  return (
    <WebflowProvidersWrapper>
      <HelloUser {...props} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(HelloUserWrapper, {
  name: 'Hello User',
  description: 'A personalized greeting header that displays the user name',
  group: 'Content',
  props: {
    userName: props.Text({
      name: 'User Name',
      defaultValue: '',
      tooltip: 'User name to display. Leave empty to use authenticated user or "Guest"',
    }),
    variant: props.Variant({
      name: 'Size Variant',
      options: ['default', 'large', 'minimal'],
      defaultValue: 'default',
      tooltip: 'Display size of the greeting',
    }),
    showGreeting: props.Boolean({
      name: 'Show "Hello" Text',
      defaultValue: true,
      tooltip: 'Show "Hello, " before the user name',
    }),
  },
});
