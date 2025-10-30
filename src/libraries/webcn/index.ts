import type { LibraryConfig } from "../types";

export const webcnLibrary: LibraryConfig = {
  name: "webcn Landing Page",
  description: "Landing page components for webcn - Webflow full-stack React component framework",
  id: "webcn-landing",

  // Environment variables exposed to this library
  env: {
    // Add any environment variables needed for the landing page
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Deployment configuration
  deploy: {
    enabled: true, // Auto-deploy on merge to main
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
