'use client';

import { declareComponent } from '@webflow/react';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import ProfileEditor from '@/components/ProfileEditor';

export function ProfileEditorWrapper() {
  return (
    <WebflowProvidersWrapper>
      <ProfileEditor />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ProfileEditorWrapper, {
  name: 'Profile Editor',
  description: 'Edit user profile information including display name, bio, avatar, and website',
  group: 'BlogFlow',
  props: {},
});
