import type { LibraryConfig } from "../types";

export const registryDashboardLibrary: LibraryConfig = {
  name: "Component Registry Dashboard",
  description: "Component library viewer and documentation interface",
  id: "blogflow-registry-dashboard",

  componentMetadata: [
    {
      id: "registry-component-grid",
      name: "Component Grid",
      description: "Grid view of all components organized by library",
      category: "Registry",
      dependencies: [],
      props: [],
      usageExample: `<ComponentGridWrapper />`,
      tags: ["registry", "grid", "components", "library", "viewer"],
      filePath: "src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx",
    },
    {
      id: "registry-detail-header",
      name: "Component Detail Header",
      description: "Header section showing component name, description, and tags",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to display (e.g., 'core-login-form'). If not provided, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailHeaderWrapper componentId="core-login-form" />`,
      tags: ["registry", "detail", "header", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow.tsx",
    },
    {
      id: "registry-detail-preview",
      name: "Component Detail Preview",
      description: "Live preview of the component with default props",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to preview. If not provided, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailPreviewWrapper componentId="core-login-form" />`,
      tags: ["registry", "preview", "live", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx",
    },
    {
      id: "registry-detail-props",
      name: "Component Detail Props",
      description: "Documentation table showing all component props",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show props for. If not provided, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailPropsWrapper componentId="core-login-form" />`,
      tags: ["registry", "props", "documentation", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailProps.webflow.tsx",
    },
    {
      id: "registry-detail-usage",
      name: "Component Detail Usage",
      description: "Code usage example with copy button",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show usage for. If not provided, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailUsageWrapper componentId="core-login-form" />`,
      tags: ["registry", "usage", "example", "code"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow.tsx",
    },
    {
      id: "registry-detail-sidebar",
      name: "Component Detail Sidebar",
      description: "Sidebar showing component metadata, dependencies, and library info",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show metadata for. If not provided, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailSidebarWrapper componentId="core-login-form" />`,
      tags: ["registry", "sidebar", "metadata", "dependencies"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailSidebar.webflow.tsx",
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
