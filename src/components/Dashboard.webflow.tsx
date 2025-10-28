/**
 * Dashboard Webflow Component Wrapper
 * Wraps the Dashboard component for use in Webflow Code Components
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Dashboard from '@/components/Dashboard';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

interface DashboardWebflowProps {
  showLogout: boolean;
}

function DashboardWrapper({ showLogout }: DashboardWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <Dashboard showLogout={showLogout} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(DashboardWrapper, {
  name: 'Dashboard',
  description: 'User dashboard displaying profile information and quick actions',
  group: 'Dashboard',
  props: {
    showLogout: props.Boolean({
      name: 'Show Logout Button',
      defaultValue: true,
      tooltip: 'Display logout button in the profile card',
    }),
  },
});
