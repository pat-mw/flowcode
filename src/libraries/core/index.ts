import type { LibraryConfig } from "../types";

export const coreLibrary: LibraryConfig = {
  name: "BlogFlow Core",
  description: "Core authentication, posts, and navigation components",
  id: "blogflow-core",

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED:
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
  },

  // Deployment configuration
  deploy: {
    enabled: false,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
