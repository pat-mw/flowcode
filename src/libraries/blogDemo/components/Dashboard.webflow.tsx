/**
 * Dashboard Webflow Component Wrapper
 * Main dashboard view with stats and quick actions
 */

'use client';

import { declareComponent } from '@webflow/react';
import Dashboard from '@/components/Dashboard';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function DashboardWrapper() {
  return (
    <WebflowProvidersWrapper>
      <Dashboard />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(DashboardWrapper, {
  name: 'Dashboard',
  description: 'Main dashboard view with stats, recent posts, and quick actions. Requires authentication.',
  group: 'BlogFlow Demo',
  props: {},
});
