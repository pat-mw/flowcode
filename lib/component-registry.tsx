/**
 * CRITICAL! This makes the bundle size absolutely massive, cannot build for Webflow.
 * Still potentially useful for testing and development, but not yet a production feature
 * 
 * Component Registry for Live Previews
 * Maps component IDs to their actual RAW React components (NOT Webflow wrappers)
 *
 * CRITICAL ARCHITECTURE RULE:
 * - This registry uses RAW components from /components folder
 * - Webflow wrappers (.webflow.tsx) are ONLY for Webflow deployment
 * - Dynamic imports work with raw components (not wrappers)
 * - Wrappers break when bundled with Webflow's webpack config
 *
 * Why raw components?
 * 1. Dynamic imports work reliably in Next.js
 * 2. No Webflow bundler compatibility issues
 * 3. Smaller bundle size (no wrapper overhead)
 * 4. Faster loading (lazy loaded on demand)
 * 5. Better development experience (direct access to implementations)
 * 
 * CRITICAL! This makes the bundle size absolutely massive, cannot build for Webflow.
 * Still potentially useful for testing and development, but not yet a production feature
 */

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// ============================================================================
// CORE LIBRARY COMPONENTS
// ============================================================================

const LoginForm = dynamic(() => import("@/components/LoginForm"), {
  ssr: false,
});
const RegistrationForm = dynamic(() => import("@/components/RegistrationForm"), {
  ssr: false,
});
const PostEditor = dynamic(() => import("@/components/PostEditor"), {
  ssr: false,
});
const Navigation = dynamic(() => import("@/components/Navigation"), {
  ssr: false,
});
const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
});
const HelloUser = dynamic(() => import("@/components/HelloUser"), {
  ssr: false,
});

// ============================================================================
// ANALYTICS LIBRARY COMPONENTS
// ============================================================================

const ChartTest = dynamic(() => import("@/components/ChartTest"), {
  ssr: false,
});
const PieChartDemo = dynamic(() => import("@/components/PieChartDemo"), {
  ssr: false,
});
const BarChartDemo = dynamic(() => import("@/components/BarChartDemo"), {
  ssr: false,
});

// ============================================================================
// INTERACTIVE LIBRARY COMPONENTS
// ============================================================================

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
  ssr: false,
});
const BlueSlider = dynamic(
  () => import("@/src/libraries/interactive/components/BlueSlider"),
  { ssr: false }
);
const RedSlider = dynamic(
  () => import("@/src/libraries/interactive/components/RedSlider"),
  { ssr: false }
);
const LaserFlowHero = dynamic(
  () => import("@/components/react-bits/laser-flow/hero"),
  { ssr: false }
);

// ============================================================================
// WEBCN LIBRARY COMPONENTS
// ============================================================================

const ArchitectureSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/ArchitectureSection"),
  { ssr: false }
);
const BlogCTA = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/BlogCTA"),
  { ssr: false }
);
const ComponentCard = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/ComponentCard"),
  { ssr: false }
);
const DemoSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/DemoSection"),
  { ssr: false }
);
const Features = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/Features"),
  { ssr: false }
);
const FeaturesSummary = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/FeaturesSummary"),
  { ssr: false }
);
const Footer = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/Footer"),
  { ssr: false }
);
const Hero = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/Hero"),
  { ssr: false }
);
const HubDashboardSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/HubDashboardSection"),
  { ssr: false }
);
const HubDashboardSectionImage = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/HubDashboardSectionImage"),
  { ssr: false }
);
const Navbar = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/Navbar"),
  { ssr: false }
);
const StorySection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/StorySection"),
  { ssr: false }
);
const StylingControlSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/StylingControlSection"),
  { ssr: false }
);
const StylingControlSectionImage = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/StylingControlSectionImage"),
  { ssr: false }
);
const VideoSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/VideoSection"),
  { ssr: false }
);
const WaitlistSection = dynamic(
  () => import("@/components/webcn/landing_page/webcn.webflow.io/WaitlistSection"),
  { ssr: false }
);

// ============================================================================
// WAITLIST LIBRARY COMPONENTS
// ============================================================================

const WaitlistCapture = dynamic(
  () => import("@/components/waitlist/WaitlistCapture"),
  { ssr: false }
);
const WaitlistAdmin = dynamic(
  () => import("@/components/waitlist/WaitlistAdmin"),
  { ssr: false }
);

// ============================================================================
// REGISTRY DASHBOARD LIBRARY COMPONENTS
// ============================================================================

const ComponentGrid = dynamic(
  () => import("@/components/registry-dashboard/ComponentGrid"),
  { ssr: false }
);
const ComponentDetailHeader = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailHeader"),
  { ssr: false }
);
const ComponentDetailHeaderCentered = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailHeaderCentered"),
  { ssr: false }
);
const ComponentDetailPreview = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailPreview"),
  { ssr: false }
);
const ComponentDetailPreviewSlot = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailPreviewSlot"),
  { ssr: false }
);
const ComponentDetailProps = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailProps"),
  { ssr: false }
);
const ComponentDetailUsage = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailUsage"),
  { ssr: false }
);
const ComponentDetailSidebar = dynamic(
  () => import("@/components/registry-dashboard/ComponentDetailSidebar"),
  { ssr: false }
);

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Registry mapping component IDs to their raw React components
 *
 * NOTE: These are RAW components, NOT Webflow wrappers
 * Wrappers are only used in:
 * 1. Webflow deployment (via .webflow.tsx files)
 * 2. app/(tests)/test-webflow-wrappers page (for testing)
 */
export const componentRegistry: Record<string, ComponentType<Record<string, unknown>>> = {
  // Core
  "core-login-form": LoginForm,
  "core-registration-form": RegistrationForm,
  "core-post-editor": PostEditor,
  "core-navigation": Navigation,
  "core-dashboard": Dashboard,
  "core-hello-user": HelloUser,

  // Analytics
  "analytics-chart-test": ChartTest,
  "analytics-pie-chart": PieChartDemo,
  "analytics-bar-chart": BarChartDemo,

  // Interactive
  "interactive-lanyard": Lanyard,
  "interactive-blue-slider": BlueSlider,
  "interactive-red-slider": RedSlider,
  "interactive-laser-flow-hero": LaserFlowHero,

  // webcn
  "webcn-architecture": ArchitectureSection,
  "webcn-blog-cta": BlogCTA,
  "webcn-component-card": ComponentCard,
  "webcn-demo-section": DemoSection,
  "webcn-features": Features,
  "webcn-features-summary": FeaturesSummary,
  "webcn-footer": Footer,
  "webcn-hero": Hero,
  "webcn-hub-dashboard": HubDashboardSection,
  "webcn-hub-dashboard-section-image": HubDashboardSectionImage,
  "webcn-navbar": Navbar,
  "webcn-story-section": StorySection,
  "webcn-styling-control": StylingControlSection,
  "webcn-styling-control-section-image": StylingControlSectionImage,
  "webcn-video-section": VideoSection,
  "webcn-waitlist": WaitlistSection,
  "webcn-waitlist-section": WaitlistSection, // Alias for backward compatibility

  // Waitlist
  "waitlist-capture": WaitlistCapture,
  "waitlist-admin": WaitlistAdmin,

  // Registry Dashboard
  "registry-component-grid": ComponentGrid,
  "registry-component-detail-header": ComponentDetailHeader,
  "registry-component-detail-header-centered": ComponentDetailHeaderCentered,
  "registry-component-detail-preview": ComponentDetailPreview,
  "registry-component-detail-preview-slot": ComponentDetailPreviewSlot,
  "registry-detail-props": ComponentDetailProps,
  "registry-detail-usage": ComponentDetailUsage,
  "registry-detail-sidebar": ComponentDetailSidebar,
};

/**
 * Get component by ID
 * Returns raw React component (NOT Webflow wrapper)
 */
export function getComponentWrapper(id: string): ComponentType<Record<string, unknown>> | null {
  return componentRegistry[id] || null;
}
