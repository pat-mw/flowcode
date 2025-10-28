import { defineLibraries } from "./types";

export const libraries = defineLibraries({
  core: {
    name: "BlogFlow Core",
    description: "Core authentication, posts, and navigation components",
    id: "blogflow-core",

    // Component discovery pattern
    components: "./src/libraries/core/**/*.webflow.@(ts|tsx)",

    // Bundle configuration
    bundleConfig: "./webpack.webflow.js",

    // Environment variables exposed to this library
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED:
        process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
    },

    // Deployment configuration
    deploy: {
      enabled: true,
      workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
    },
  },

  analytics: {
    name: "BlogFlow Analytics",
    description: "Charts, metrics, and data visualization components",
    id: "blogflow-analytics",
    components: "./src/libraries/analytics/**/*.webflow.@(ts|tsx)",
    bundleConfig: "./webpack.webflow.js",

    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },

    deploy: {
      enabled: true,
      workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
    },
  },

  interactive: {
    name: "BlogFlow Interactive 3D",
    description: "3D models and interactive experiences",
    id: "blogflow-interactive",
    components: "./src/libraries/interactive/**/*.webflow.@(ts|tsx)",
    bundleConfig: "./webpack.webflow.js",

    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },

    deploy: {
      enabled: false, // Optional library, not auto-deployed
    },
  },
});

// Export type for use in scripts
export type LibraryRegistry = typeof libraries;
export type LibraryKey = keyof LibraryRegistry;
