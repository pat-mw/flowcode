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
        "Email capture form for waitlist signups with optional name and company fields",
      category: "Waitlist",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: ["waitlist.join"],
      props: [
        {
          name: "title",
          type: "Text",
          description: "Main heading for the waitlist form",
          defaultValue: "Join the Waitlist",
          required: false,
        },
        {
          name: "subtitle",
          type: "Text",
          description: "Subtitle text below the heading",
          defaultValue:
            "Be the first to know when we launch. Get exclusive early access.",
          required: false,
        },
        {
          name: "buttonText",
          type: "Text",
          description: "Text displayed on the submit button",
          defaultValue: "Join Waitlist",
          required: false,
        },
        {
          name: "successMessage",
          type: "Text",
          description: "Message shown after successful signup",
          defaultValue: "You're on the list! We'll be in touch soon.",
          required: false,
        },
        {
          name: "showNameField",
          type: "Boolean",
          description: "Display optional name input field",
          defaultValue: true,
          required: false,
        },
        {
          name: "showCompanyField",
          type: "Boolean",
          description: "Display optional company input field",
          defaultValue: false,
          required: false,
        },
        {
          name: "referralSource",
          type: "Text",
          description:
            'Track where signups came from (e.g., "landing-page", "blog")',
          defaultValue: "",
          required: false,
        },
        {
          name: "placeholderEmail",
          type: "Text",
          description: "Placeholder text for email field",
          defaultValue: "Enter your email",
          required: false,
        },
        {
          name: "placeholderName",
          type: "Text",
          description: "Placeholder text for name field",
          defaultValue: "Your name",
          required: false,
        },
        {
          name: "placeholderCompany",
          type: "Text",
          description: "Placeholder text for company field",
          defaultValue: "Company name",
          required: false,
        },
      ],
      usageExample: `<WaitlistCapture title="Join the Waitlist" showNameField={true} showCompanyField={false} />`,
      tags: ["waitlist", "capture", "email", "form", "signup"],
      filePath: "src/libraries/waitlist/components/WaitlistCapture.webflow.tsx",
    },
    {
      id: "waitlist-admin",
      name: "Waitlist Admin",
      description:
        "Admin dashboard for managing waitlist entries with statistics and actions",
      category: "Waitlist",
      dependencies: ["@tanstack/react-query"],
      backendDependencies: ["waitlist.list", "waitlist.delete"],
      props: [
        {
          name: "title",
          type: "Text",
          description: "Dashboard heading",
          defaultValue: "Waitlist Management",
          required: false,
        },
        {
          name: "refreshInterval",
          type: "Number",
          description: "Auto-refresh interval in milliseconds (0 to disable)",
          defaultValue: 30000,
          required: false,
        },
      ],
      usageExample: `<WaitlistAdmin title="Waitlist Management" refreshInterval={30000} />`,
      tags: ["waitlist", "admin", "dashboard", "management"],
      filePath: "src/libraries/waitlist/components/WaitlistAdmin.webflow.tsx",
    },
  ],

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
