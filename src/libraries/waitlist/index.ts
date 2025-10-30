/**
 * Waitlist Library
 * Email capture and admin management components
 */

import type { LibraryConfig } from "../types";

export const waitlistLibrary: LibraryConfig = {
  name: "BlogFlow Waitlist",
  description: "Email waitlist capture and admin management components",
  id: "blogflow-waitlist",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  deploy: {
    enabled: true,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};

export { default as WaitlistCapture, WaitlistCaptureWrapper } from './components/WaitlistCapture.webflow';
export { default as WaitlistAdmin, WaitlistAdminWrapper } from './components/WaitlistAdmin.webflow';
