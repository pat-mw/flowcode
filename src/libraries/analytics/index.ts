import type { LibraryConfig } from "../types";

export const analyticsLibrary: LibraryConfig = {
  name: "BlogFlow Analytics",
  description: "Charts, metrics, and data visualization components",
  id: "blogflow-analytics",

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Deployment configuration
  deploy: {
    enabled: true,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
