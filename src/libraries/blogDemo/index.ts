import type { LibraryConfig } from "../types";

export const blogDemoLibrary: LibraryConfig = {
  name: "BlogFlow Demo",
  description: "Complete blog platform components including posts management, profiles, and public blog views",
  id: "blogflow-demo",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "blog-navigation",
      name: "Navigation",
      description: "Responsive navigation bar with authentication state management",
      category: "Layout",
      dependencies: ["lucide-react"],
      backendDependencies: ["auth.getSession"],
      props: [
        {
          name: "brandName",
          type: "Text",
          description: "The name of your brand or site",
          defaultValue: "BlogFlow",
          required: false,
        },
        {
          name: "brandLogo",
          type: "Text",
          description: "Optional URL to your logo image",
          defaultValue: "",
          required: false,
        },
        {
          name: "variant",
          type: "Variant",
          description: "Navigation layout style",
          defaultValue: "default",
          required: false,
          options: [
            { label: "Default", value: "default" },
            { label: "Minimal", value: "minimal" },
            { label: "Centered", value: "centered" },
          ],
        },
      ],
      usageExample: `<NavigationWrapper brandName="BlogFlow" variant="default" />`,
      tags: ["navigation", "navbar", "menu", "layout"],
      filePath: "src/libraries/blogDemo/components/Navigation.webflow.tsx",
    },
    {
      id: "blog-post-editor",
      name: "Post Editor",
      description: "Rich text editor with auto-save for creating and editing blog posts",
      category: "Content Management",
      dependencies: ["@tanstack/react-query", "@tiptap/react", "lucide-react", "sonner"],
      backendDependencies: ["posts.create", "posts.update", "posts.list"],
      props: [],
      usageExample: `<PostEditorWrapper />`,
      tags: ["editor", "post", "content", "rich-text", "tiptap"],
      filePath: "src/libraries/blogDemo/components/PostEditor.webflow.tsx",
    },
    {
      id: "blog-posts-list",
      name: "Posts List",
      description: "User's posts management dashboard with filtering, search, and CRUD operations",
      category: "Content Management",
      dependencies: ["@tanstack/react-query", "lucide-react", "sonner"],
      backendDependencies: ["posts.list", "posts.delete", "posts.publish"],
      props: [
        {
          name: "defaultFilter",
          type: "Variant",
          description: "Default filter for posts view",
          defaultValue: "all",
          required: false,
          options: [
            { label: "All Posts", value: "all" },
            { label: "Published", value: "published" },
            { label: "Drafts", value: "draft" },
          ],
        },
        {
          name: "showCreateButton",
          type: "Boolean",
          description: "Show create new post button",
          defaultValue: true,
          required: false,
        },
      ],
      usageExample: `<PostsListWrapper defaultFilter="all" showCreateButton={true} />`,
      tags: ["posts", "management", "crud", "content"],
      filePath: "src/libraries/blogDemo/components/PostsList.webflow.tsx",
    },
    {
      id: "blog-profile-editor",
      name: "Profile Editor",
      description: "User profile editor for managing display name, bio, avatar, and website",
      category: "User Profile",
      dependencies: ["@tanstack/react-query", "lucide-react", "sonner"],
      backendDependencies: ["people.getMe", "people.update"],
      props: [
        {
          name: "showCancelButton",
          type: "Boolean",
          description: "Show cancel button that redirects to dashboard",
          defaultValue: true,
          required: false,
        },
      ],
      usageExample: `<ProfileEditorWrapper showCancelButton={true} />`,
      tags: ["profile", "user", "edit", "form"],
      filePath: "src/libraries/blogDemo/components/ProfileEditor.webflow.tsx",
    },
    {
      id: "blog-public-posts",
      name: "Public Posts List",
      description: "Public blog index with published posts, search, and pagination",
      category: "Public Blog",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: ["posts.publicList"],
      props: [
        {
          name: "pageSize",
          type: "Number",
          description: "Number of posts per page",
          defaultValue: 9,
          required: false,
        },
        {
          name: "enableSearch",
          type: "Boolean",
          description: "Enable search functionality",
          defaultValue: true,
          required: false,
        },
        {
          name: "title",
          type: "Text",
          description: "Page title",
          defaultValue: "Blog",
          required: false,
        },
        {
          name: "subtitle",
          type: "Text",
          description: "Page subtitle",
          defaultValue: "Latest published posts",
          required: false,
        },
      ],
      usageExample: `<PublicPostsListWrapper pageSize={9} enableSearch={true} title="Blog" subtitle="Latest posts" />`,
      tags: ["blog", "public", "posts", "pagination"],
      filePath: "src/libraries/blogDemo/components/PublicPostsList.webflow.tsx",
    },
    {
      id: "blog-post-view",
      name: "Post View",
      description: "Individual post view with full content, author info, and edit capability",
      category: "Public Blog",
      dependencies: ["@tanstack/react-query", "lucide-react"],
      backendDependencies: ["posts.publicList"],
      props: [
        {
          name: "postId",
          type: "Text",
          description: "Post ID to display (required)",
          defaultValue: "",
          required: true,
        },
        {
          name: "showBackButton",
          type: "Boolean",
          description: "Show back to blog button",
          defaultValue: true,
          required: false,
        },
      ],
      usageExample: `<PostViewWrapper postId="123" showBackButton={true} />`,
      tags: ["post", "view", "detail", "content"],
      filePath: "src/libraries/blogDemo/components/PostView.webflow.tsx",
    },
  ],

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Deployment configuration
  deploy: {
    enabled: false, // Enable when ready for deployment
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
