import type { LibraryConfig} from "../types";

export const interactiveLibrary: LibraryConfig = {
  name: "BlogFlow Interactive 3D",
  description: "3D models and interactive experiences",
  id: "blogflow-interactive",

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Deployment configuration
  deploy: {
    enabled: false, // Optional library, not auto-deployed
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
