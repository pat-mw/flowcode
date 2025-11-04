import type { LibraryConfig } from "../types";

export const registryDashboardLibrary: LibraryConfig = {
  name: "Component Registry Dashboard",
  description: "Component library viewer and documentation interface",
  id: "blogflow-registry-dashboard",

  componentMetadata: [
    {
      id: "registry-component-card",
      name: "Component Card",
      description: "Individual component card for showcasing components in collection lists - displays component preview, name, category, and description",
      category: "Registry",
      dependencies: [],
      props: [
        {
          name: "previewImage",
          type: "Text",
          description: "URL to preview image (leave empty for placeholder)",
          defaultValue: "",
          required: false,
        },
        {
          name: "componentName",
          type: "Text",
          description: "Name of the component",
          defaultValue: "Component Name",
          required: false,
        },
        {
          name: "category",
          type: "Text",
          description: "Category tag (e.g., UI, Full-Stack, Interactive)",
          defaultValue: "UI",
          required: false,
        },
        {
          name: "description",
          type: "Text",
          description: "Brief description of what the component does",
          defaultValue: "Component description",
          required: false,
        },
        {
          name: "link",
          type: "JSON",
          description: "Link to component details or demo (includes URL, target, and preload options)",
          defaultValue: { href: "#", target: "_self" },
          required: false,
        },
        {
          name: "buttonText",
          type: "Text",
          description: "Text displayed on the action button",
          defaultValue: "View Component",
          required: false,
        },
        {
          name: "isFullStack",
          type: "Boolean",
          description: "If true, uses primary badge color; if false, uses secondary",
          defaultValue: false,
          required: false,
        },
      ],
      usageExample: `<ComponentCardWrapper
  componentName="Login Form"
  category="Authentication"
  description="Secure login form with OAuth integration"
  link={{ href: "/components/login-form", target: "_self" }}
  buttonText="View Details"
  isFullStack={true}
/>`,
      tags: ["registry", "card", "component", "preview", "grid-item"],
      filePath: "src/libraries/registry-dashboard/components/ComponentCard.webflow.tsx",
    },
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
      id: "registry-component-detail-header-centered",
      name: "Component Detail Header (Centered)",
      description:
        "Centered variant of header section showing component name, description, library badge, and tags. Supports CMS data injection.",
      category: "Registry Dashboard",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description:
            'Component ID to display (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
          defaultValue: "",
          required: false,
        },
        {
          name: "backToLibraryUrl",
          type: "Text",
          description:
            'URL for the "Back to Library" button. Defaults to "/lander/webcn".',
          defaultValue: "/lander/webcn",
          required: false,
        },
        {
          name: "cmsName",
          type: "Text",
          description:
            'Optional: Component name from Webflow CMS. Bind to CMS field "name".',
          defaultValue: "",
          required: false,
        },
        {
          name: "cmsComponentId",
          type: "Text",
          description:
            'Optional: Component ID from Webflow CMS. Bind to CMS field "component-id".',
          defaultValue: "",
          required: false,
        },
        {
          name: "cmsDescription",
          type: "Text",
          description:
            'Optional: Component description from Webflow CMS. Bind to CMS field "description".',
          defaultValue: "",
          required: false,
        },
        {
          name: "cmsCategory",
          type: "Text",
          description:
            'Optional: Component category from Webflow CMS. Bind to CMS field "category".',
          defaultValue: "",
          required: false,
        },
        {
          name: "cmsTags",
          type: "Text",
          description:
            'Optional: Comma-separated tags from Webflow CMS. Bind to CMS field "tags".',
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<ComponentDetailHeaderCentered componentId="core-login-form" backToLibraryUrl="/lander/webcn" />`,
      tags: ["header", "centered", "documentation", "cms"],
      filePath:
        "src/libraries/registryDashboard/components/ComponentDetailHeaderCentered.webflow.tsx",
    },
    {
      id: "registry-component-detail-preview-slot",
      name: "Component Detail Preview (Slot)",
      description:
        "Component preview card with slot for custom images. Includes hover overlay and footer button.",
      category: "Registry Dashboard",
      dependencies: [],
      props: [
        {
          name: "componentId",
          type: "Text",
          description:
            'Component ID to preview (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
          defaultValue: "",
          required: false,
        },
        {
          name: "previewBaseUrl",
          type: "Text",
          description:
            'Base URL for the preview site (e.g., "https://yoursite.com"). Path /lander/webcn/component will be appended.',
          defaultValue: "",
          required: false,
        },
        // Note: Slot type is not supported in component metadata
        // {
        //   name: "children",
        //   type: "Slot",
        //   description:
        //     "Slot for component preview image. Drop an image or any element here.",
        //   defaultValue: null,
        //   required: false,
        // },
      ],
      usageExample: `<ComponentDetailPreviewSlot componentId="core-login-form" previewBaseUrl="https://yoursite.com" />`,
      tags: ["preview", "slot", "image", "documentation"],
      filePath:
        "src/libraries/registryDashboard/components/ComponentDetailPreviewSlot.webflow.tsx",
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
