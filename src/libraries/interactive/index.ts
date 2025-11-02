import type { LibraryConfig } from "../types";

export const interactiveLibrary: LibraryConfig = {
  name: "Flowcode Interactive 3D",
  description: "3D models and interactive experiences",
  id: "flowcode-interactive",

  // Component metadata for library viewer
  componentMetadata: [
    {
      id: "interactive-lanyard",
      name: "Lanyard",
      description:
        "3D physics-based lanyard simulation with configurable gravity and appearance",
      category: "3D",
      dependencies: [
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/rapier",
        "three",
      ],
      props: [
        {
          name: "gravity",
          type: "Number",
          description: "Gravity strength for physics simulation",
          defaultValue: -9.81,
          required: false,
        },
        {
          name: "position",
          type: "Text",
          description: "Initial camera position (x,y,z)",
          defaultValue: "0,5,10",
          required: false,
        },
      ],
      usageExample: `<LanyardWrapper gravity={-9.81} position="0,5,10" />`,
      tags: ["3d", "physics", "three.js", "interactive"],
      filePath: "src/libraries/interactive/components/Lanyard.webflow.tsx",
    },
    {
      id: "interactive-blue-slider",
      name: "Blue Slider",
      description:
        "Slider component controlling shared blue value state (Zustand demo)",
      category: "Interactive",
      dependencies: ["zustand"],
      props: [],
      usageExample: `<BlueSliderWrapper />`,
      tags: ["slider", "state", "zustand", "demo"],
      filePath: "src/libraries/interactive/components/BlueSlider.webflow.tsx",
    },
    {
      id: "interactive-red-slider",
      name: "Red Slider",
      description:
        "Slider component displaying red value (inverse of blue, Zustand demo)",
      category: "Interactive",
      dependencies: ["zustand"],
      props: [],
      usageExample: `<RedSliderWrapper />`,
      tags: ["slider", "state", "zustand", "demo"],
      filePath: "src/libraries/interactive/components/RedSlider.webflow.tsx",
    },
    {
      id: "interactive-laser-flow-hero",
      name: "LaserFlow Hero",
      description:
        "Interactive 3D laser flow effect with animated hero section and customizable title display",
      category: "3D Effects",
      dependencies: ["three"],
      props: [
        {
          name: "title",
          type: "Text",
          description: "Text displayed in the central box",
          defaultValue: "Flowcode",
          required: false,
        },
        {
          name: "wispDensity",
          type: "Number",
          description: "Density of animated wisps (0-2)",
          defaultValue: 1,
          required: false,
        },
        {
          name: "flowSpeed",
          type: "Number",
          description: "Speed of the laser flow animation",
          defaultValue: 0.35,
          required: false,
        },
        {
          name: "color",
          type: "Text",
          description: "Color of the laser effect (CSS color or var)",
          defaultValue: "var(--color-primary)",
          required: false,
        },
      ],
      usageExample: `<LaserFlowHeroWrapper title="Flowcode" wispDensity={1} flowSpeed={0.35} color="var(--color-primary)" />`,
      tags: ["3d", "laser", "hero", "animation", "interactive", "webgl"],
      filePath: "src/libraries/interactive/components/LaserFlowHero.webflow.tsx",
    },
  ],

  // Environment variables exposed to this library
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Deployment configuration
  deploy: {
    enabled: false, // Optional library, not auto-deployed
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
