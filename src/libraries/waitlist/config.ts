import type { LibraryConfig } from "../types";

export const waitlistLibrary: LibraryConfig = {
  name: "Flowcode Waitlist",
  description: "Email waitlist capture and admin management components",
  id: "flowcode-waitlist",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "waitlist-capture",
      name: "Waitlist Capture",
      description:
        "Email capture form for waitlist signups with validation and success states",
      category: "Forms",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: ["waitlist.join"],
      props: [
        {
          name: "title",
          type: "Text",
          description: "Form title text",
          defaultValue: "Join the Waitlist",
          required: false,
        },
        {
          name: "subtitle",
          type: "Text",
          description: "Form subtitle/description",
          defaultValue: "Be the first to know when we launch",
          required: false,
        },
      ],
      usageExample: `<WaitlistCaptureWrapper title="Join Us" subtitle="Get early access" />`,
      tags: ["waitlist", "form", "email", "capture"],
      filePath: "src/libraries/waitlist/components/WaitlistCapture.webflow.tsx",
    },
    {
      id: "waitlist-admin",
      name: "Waitlist Admin",
      description:
        "Admin dashboard for managing waitlist entries with filtering and status updates",
      category: "Admin",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: [
        "waitlist.getAll",
        "waitlist.getStats",
        "waitlist.update",
        "waitlist.remove",
        "waitlist.bulkUpdate",
      ],
      props: [],
      usageExample: `<WaitlistAdminWrapper />`,
      tags: ["waitlist", "admin", "dashboard", "management"],
      filePath: "src/libraries/waitlist/components/WaitlistAdmin.webflow.tsx",
    },
  ],

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  deploy: {
    enabled: false,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};


