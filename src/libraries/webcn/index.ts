import type { LibraryConfig } from "../types";

export const webcnLibrary: LibraryConfig = {
  name: "webcn Landing Page",
  description:
    "Landing page components for webcn - Webflow full-stack React component framework",
  id: "webcn-landing",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "webcn-navbar",
      name: "Navbar",
      description:
        "Responsive navigation bar with configurable links and theme support",
      category: "Navigation",
      props: [
        {
          name: "logoText",
          type: "Text",
          description: "Logo text",
          defaultValue: "webcn",
          required: false,
        },
        {
          name: "navLinks",
          type: "JSON",
          description: "Array of navigation links",
          defaultValue: [],
          required: false,
        },
      ],
      usageExample: `<NavbarWrapper logoText="webcn" navLinks={[{label: 'Features', href: '#features'}]} />`,
      tags: ["navigation", "navbar", "landing"],
      filePath: "src/libraries/webcn/components/Navbar.webflow.tsx",
    },
    {
      id: "webcn-hero",
      name: "Hero",
      description:
        "Hero section with headline, description, and call-to-action buttons",
      category: "Landing",
      props: [
        {
          name: "headline",
          type: "Text",
          description: "Main headline text",
          defaultValue: "Build with React. Deploy to Webflow.",
          required: false,
        },
        {
          name: "subtitle",
          type: "Text",
          description: "Subtitle/description text",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<HeroWrapper headline="Build faster" subtitle="With full-stack components" />`,
      tags: ["hero", "landing", "cta"],
      filePath: "src/libraries/webcn/components/Hero.webflow.tsx",
    },
    {
      id: "webcn-features",
      name: "Features",
      description: "Features grid showcasing product capabilities",
      category: "Landing",
      props: [
        {
          name: "sectionTitle",
          type: "Text",
          description: "Features section title",
          defaultValue: "Features",
          required: false,
        },
      ],
      usageExample: `<FeaturesWrapper sectionTitle="Key Features" />`,
      tags: ["features", "landing", "grid"],
      filePath: "src/libraries/webcn/components/Features.webflow.tsx",
    },
    {
      id: "webcn-footer",
      name: "Footer",
      description: "Landing page footer with links and copyright",
      category: "Navigation",
      props: [
        {
          name: "copyrightText",
          type: "Text",
          description: "Copyright text",
          defaultValue: "© 2025 webcn",
          required: false,
        },
      ],
      usageExample: `<FooterWrapper copyrightText="© 2025 Your Company" />`,
      tags: ["footer", "landing", "navigation"],
      filePath: "src/libraries/webcn/components/Footer.webflow.tsx",
    },
    {
      id: "webcn-waitlist-section",
      name: "Waitlist Section",
      description:
        "Landing page section embedding the waitlist capture form",
      category: "Landing",
      props: [],
      usageExample: `<WaitlistSectionWrapper />`,
      tags: ["waitlist", "landing", "cta"],
      filePath: "src/libraries/webcn/components/WaitlistSection.webflow.tsx",
    },
  ],

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
