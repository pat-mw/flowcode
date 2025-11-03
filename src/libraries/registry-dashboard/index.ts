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
      props: [
        {
          name: "sectionTitle",
          type: "Text",
          description: "Main heading for the component grid section",
          defaultValue: "Component Library",
          required: false,
        },
        {
          name: "sectionSubtitle",
          type: "Text",
          description: "Subtitle text below the section heading",
          defaultValue: "Explore our growing collection of production-ready components",
          required: false,
        },
        {
          name: "viewAllButtonText",
          type: "Text",
          description: "Text for the view all components button (currently unused)",
          defaultValue: "View All Components",
          required: false,
        },
        {
          name: "basePath",
          type: "Text",
          description: "Base URL path for component detail pages. Component ID will be appended as ?id=",
          defaultValue: "/lander/webcn/component",
          required: false,
        },
      ],
      usageExample: `<ComponentGridWrapper basePath="/lander/webcn/component" />`,
      tags: ["registry", "grid", "components", "library", "viewer"],
      filePath: "src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx",
    },
    {
      id: "registry-detail-header",
      name: "Component Detail Header",
      description: "Header section showing component name, description, library badge, and tags",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to display (e.g., 'core-login-form'). If empty, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailHeaderWrapper componentId="core-login-form" />`,
      tags: ["registry", "header", "detail", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow.tsx",
    },
    {
      id: "registry-detail-preview",
      name: "Component Detail Preview",
      description: "Link to live component preview on production site",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to preview (e.g., 'core-login-form'). If empty, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
        {
          name: "previewBaseUrl",
          type: "Text",
          description: "Base URL for the preview site (e.g., 'https://yoursite.com'). Path /lander/webcn/component will be appended.",
          defaultValue: process.env.NEXT_PUBLIC_API_URL || "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailPreviewWrapper componentId="core-login-form" previewBaseUrl="https://yoursite.com" />`,
      tags: ["registry", "preview", "detail", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx",
    },
    {
      id: "registry-detail-props",
      name: "Component Detail Props",
      description: "Documentation table showing component props with types, descriptions, and default values",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show props for (e.g., 'core-login-form'). If empty, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailPropsWrapper componentId="core-login-form" />`,
      tags: ["registry", "props", "documentation", "detail", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailProps.webflow.tsx",
    },
    {
      id: "registry-detail-usage",
      name: "Component Detail Usage",
      description: "Code example showing how to use the component with copy button",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show usage for (e.g., 'core-login-form'). If empty, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailUsageWrapper componentId="core-login-form" />`,
      tags: ["registry", "usage", "example", "code", "detail", "component"],
      filePath: "src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow.tsx",
    },
    {
      id: "registry-detail-sidebar",
      name: "Component Detail Sidebar",
      description: "Sidebar showing component metadata like library, category, dependencies, and backend requirements",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description: "Component ID to show sidebar for (e.g., 'core-login-form'). If empty, reads from URL query parameter ?id=",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailSidebarWrapper componentId="core-login-form" />`,
      tags: ["registry", "sidebar", "metadata", "detail", "component"],
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
