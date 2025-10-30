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


