/**
 * WaitlistAdmin Webflow Component Wrapper
 * Admin dashboard for managing waitlist entries
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import WaitlistAdmin, { type WaitlistAdminProps } from '@/components/waitlist/WaitlistAdmin';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';

export function WaitlistAdminWrapper({
  title,
  refreshInterval,
}: WaitlistAdminProps) {
  return (
    <WebflowProvidersWrapper>
      <WaitlistAdmin
        title={title}
        refreshInterval={refreshInterval}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(WaitlistAdminWrapper, {
  name: 'Waitlist Admin',
  description: 'Admin dashboard for managing waitlist entries with statistics and actions',
  group: 'Waitlist',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Waitlist Management',
      tooltip: 'Dashboard heading',
    }),
    refreshInterval: props.Number({
      name: 'Refresh Interval (ms)',
      defaultValue: 30000,
      tooltip: 'Auto-refresh interval in milliseconds (0 to disable)',
    }),
  },
});
