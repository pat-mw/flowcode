import type { LibraryConfig } from "../types";

export const analyticsLibrary: LibraryConfig = {
  name: "Flowcode Analytics",
  description: "Charts, metrics, and data visualization components",
  id: "flowcode-analytics",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "analytics-chart-test",
      name: "Chart Test",
      description:
        "Test component demonstrating various chart types and configurations",
      category: "Charts",
      dependencies: ["recharts"],
      props: [],
      usageExample: `<ChartTestWrapper />`,
      tags: ["chart", "demo", "visualization"],
      filePath: "src/libraries/analytics/components/ChartTest.webflow.tsx",
    },
    {
      id: "analytics-pie-chart",
      name: "Pie Chart",
      description:
        "Interactive pie chart for displaying proportional data",
      category: "Charts",
      dependencies: ["recharts"],
      props: [
        {
          name: "data",
          type: "JSON",
          description: "Array of data points with name and value properties",
          defaultValue: [],
          required: true,
        },
        {
          name: "title",
          type: "Text",
          description: "Chart title",
          defaultValue: "Pie Chart",
          required: false,
        },
      ],
      usageExample: `<PieChartDemoWrapper data={[{name: 'A', value: 400}, {name: 'B', value: 300}]} title="Distribution" />`,
      tags: ["chart", "pie", "visualization", "data"],
      filePath: "src/libraries/analytics/components/PieChartDemo.webflow.tsx",
    },
    {
      id: "analytics-bar-chart",
      name: "Bar Chart",
      description:
        "Vertical bar chart for comparing data across categories",
      category: "Charts",
      dependencies: ["recharts"],
      props: [
        {
          name: "data",
          type: "JSON",
          description: "Array of data points with category and value properties",
          defaultValue: [],
          required: true,
        },
        {
          name: "title",
          type: "Text",
          description: "Chart title",
          defaultValue: "Bar Chart",
          required: false,
        },
      ],
      usageExample: `<BarChartDemoWrapper data={[{category: 'Jan', value: 400}]} title="Monthly Sales" />`,
      tags: ["chart", "bar", "visualization", "data"],
      filePath: "src/libraries/analytics/components/BarChartDemo.webflow.tsx",
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
