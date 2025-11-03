import type { LibraryConfig } from "../types";

export const registryDashboardLibrary: LibraryConfig = {
  name: "Component Registry Dashboard",
  description: "Component library viewer and documentation interface",
  id: "blogflow-registry-dashboard",

  componentMetadata: [
    {
      id: "flowcode-registry-dashboard",
      name: "Component Grid",
      description: "Grid view of all components organized by library",
      category: "Registry",
      dependencies: [],
      props: [],
      usageExample: `<ComponentGridWrapper />`,
      tags: ["registry", "grid", "components", "library", "viewer"],
      filePath: "src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx",
    },
  ],

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  deploy: {
    enabled: true,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
