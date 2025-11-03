import type { LibraryConfig } from "../types";

export const coreLibrary: LibraryConfig = {
  name: "Flowcode Core",
  description: "Core authentication, posts, and navigation components",
  id: "flowcode-core",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "core-login-form",
      name: "Login Form",
      description:
        "User authentication form with email/password and optional Google OAuth",
      category: "Authentication",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: ["auth.signIn.email"],
      props: [
        {
          name: "redirectPath",
          type: "Text",
          description: "Path to redirect after successful login",
          defaultValue: "/dashboard",
          required: false,
        },
      ],
      usageExample: `<LoginFormWrapper redirectPath="/dashboard" />`,
      tags: ["auth", "form", "login", "oauth"],
      filePath: "src/libraries/core/components/LoginForm.webflow.tsx",
    },
    {
      id: "core-registration-form",
      name: "Registration Form",
      description:
        "User registration form with Better Auth integration",
      category: "Authentication",
      dependencies: ["react-hook-form", "zod", "zustand"],
      backendDependencies: ["auth.signUp.email"],
      props: [
        {
          name: "redirectTo",
          type: "Text",
          description: "URL to redirect to after successful registration",
          defaultValue: "/dashboard",
          required: false,
        },
        {
          name: "showGoogleAuth",
          type: "Boolean",
          description:
            "Display Google OAuth sign-in button (requires NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED environment variable)",
          defaultValue: true,
          required: false,
        },
      ],
      usageExample: `<RegistrationForm redirectTo="/dashboard" showGoogleAuth={true} />`,
      tags: ["registration", "form", "authentication", "signup", "auth"],
      filePath: "src/libraries/core/components/RegistrationForm.webflow.tsx",
    },
    {
      id: "core-post-editor",
      name: "Post Editor",
      description:
        "Rich text editor for creating and editing blog posts with auto-save",
      category: "Content",
      dependencies: ["@tanstack/react-query", "@tiptap/react", "lucide-react"],
      backendDependencies: [
        "posts.create",
        "posts.update",
        "posts.publish",
        "posts.list",
      ],
      props: [
        {
          name: "postId",
          type: "Text",
          description: "ID of existing post to edit (optional for new post)",
          defaultValue: "",
          required: false,
        },
      ],
      usageExample: `<PostEditorWrapper postId="123" />`,
      tags: ["editor", "post", "content", "rich-text"],
      filePath: "src/libraries/core/components/PostEditor.webflow.tsx",
    },
    {
      id: "core-navigation",
      name: "Navigation",
      description:
        "Global navigation bar with authentication-aware menu items",
      category: "Navigation",
      dependencies: ["lucide-react"],
      backendDependencies: ["auth.getSession"],
      props: [],
      usageExample: `<NavigationWrapper />`,
      tags: ["navigation", "navbar", "menu"],
      filePath: "src/libraries/core/components/Navigation.webflow.tsx",
    },
    {
      id: "core-dashboard",
      name: "Dashboard",
      description:
        "User dashboard displaying profile information and quick actions",
      category: "Dashboard",
      dependencies: ["zustand"],
      backendDependencies: ["auth.getSession"],
      props: [
        {
          name: "showLogout",
          type: "Boolean",
          description: "Display logout button in the profile card",
          defaultValue: true,
          required: false,
        },
      ],
      usageExample: `<Dashboard showLogout={true} />`,
      tags: ["dashboard", "profile", "user", "authentication"],
      filePath: "src/libraries/core/components/Dashboard.webflow.tsx",
    },
    {
      id: "core-hello-user",
      name: "Hello User",
      description: "Simple greeting component showing current user's name",
      category: "User",
      dependencies: ["@tanstack/react-query"],
      backendDependencies: ["auth.getSession"],
      props: [],
      usageExample: `<HelloUserWrapper />`,
      tags: ["user", "greeting", "profile"],
      filePath: "src/libraries/core/components/HelloUser.webflow.tsx",
    },
  ],

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED:
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
  },

  // Deployment configuration
  deploy: {
    enabled: false,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
