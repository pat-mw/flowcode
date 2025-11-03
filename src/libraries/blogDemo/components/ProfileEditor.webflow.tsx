/**
 * Profile Editor Webflow Component Wrapper
 * Wraps the ProfileEditor component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ProfileEditor from '@/components/ProfileEditor';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface ProfileEditorWebflowProps {
  showCancelButton: boolean;
}

export function ProfileEditorWrapper({
  showCancelButton,
}: ProfileEditorWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <ProfileEditor />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ProfileEditorWrapper, {
  name: 'Profile Editor',
  description: 'User profile editor for managing display name, bio, avatar, and website',
  group: 'BlogFlow Demo',
  props: {
    showCancelButton: props.Boolean({
      name: 'Show Cancel Button',
      defaultValue: true,
      tooltip: 'Show cancel button that redirects to dashboard',
    }),
  },
});
