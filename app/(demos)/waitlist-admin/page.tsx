'use client';

import { WaitlistAdminWrapper } from '@/src/libraries/waitlist/components/WaitlistAdmin.webflow';

export default function WaitlistAdminDemo() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto py-12 px-4">
        <WaitlistAdminWrapper
          title="Waitlist Management Dashboard"
          refreshInterval={30000}
        />
      </div>
    </div>
  );
}
