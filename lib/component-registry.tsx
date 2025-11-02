/**
 * Component Registry for Live Previews
 * Maps component IDs to their actual Webflow wrapper components
 *
 * IMPORTANT: Import NAMED exports (e.g., LoginFormWrapper), NOT default exports
 * Default exports from .webflow.tsx files are declareComponent() results (Webflow-specific)
 * Named exports are the actual React components we need for previews
 */

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Core components
const LoginFormWrapper = dynamic(
  () => import("@/src/libraries/core/components/LoginForm.webflow").then(m => m.LoginFormWrapper),
  { ssr: false }
);
const RegistrationFormWrapper = dynamic(
  () => import("@/src/libraries/core/components/RegistrationForm.webflow").then(m => m.RegistrationFormWrapper),
  { ssr: false }
);
const PostEditorWrapper = dynamic(
  () => import("@/src/libraries/core/components/PostEditor.webflow").then(m => m.PostEditorWrapper),
  { ssr: false }
);
const NavigationWrapper = dynamic(
  () => import("@/src/libraries/core/components/Navigation.webflow").then(m => m.NavigationWrapper),
  { ssr: false }
);
const DashboardWrapper = dynamic(
  () => import("@/src/libraries/core/components/Dashboard.webflow").then(m => m.DashboardWrapper),
  { ssr: false }
);
const HelloUserWrapper = dynamic(
  () => import("@/src/libraries/core/components/HelloUser.webflow").then(m => m.HelloUserWrapper),
  { ssr: false }
);

// Analytics components
const ChartTestWrapper = dynamic(
  () => import("@/src/libraries/analytics/components/ChartTest.webflow").then(m => m.ChartTestWrapper),
  { ssr: false }
);
const PieChartDemoWrapper = dynamic(
  () => import("@/src/libraries/analytics/components/PieChartDemo.webflow").then(m => m.PieChartDemoWrapper),
  { ssr: false }
);
const BarChartDemoWrapper = dynamic(
  () => import("@/src/libraries/analytics/components/BarChartDemo.webflow").then(m => m.BarChartDemoWrapper),
  { ssr: false }
);

// Interactive components
const LanyardWrapper = dynamic(
  () => import("@/src/libraries/interactive/components/Lanyard.webflow").then(m => m.LanyardWrapper),
  { ssr: false }
);
const BlueSliderWrapper = dynamic(
  () => import("@/src/libraries/interactive/components/BlueSlider.webflow").then(m => m.BlueSliderWrapper),
  { ssr: false }
);
const RedSliderWrapper = dynamic(
  () => import("@/src/libraries/interactive/components/RedSlider.webflow").then(m => m.RedSliderWrapper),
  { ssr: false }
);
const LaserFlowHeroWrapper = dynamic(
  () => import("@/src/libraries/interactive/components/LaserFlowHero.webflow").then(m => m.LaserFlowHeroWrapper),
  { ssr: false }
);

// webcn components
const NavbarWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/Navbar.webflow").then(m => m.NavbarWrapper),
  { ssr: false }
);
const HeroWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/Hero.webflow").then(m => m.HeroWrapper),
  { ssr: false }
);
const FeaturesWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/Features.webflow").then(m => m.FeaturesWrapper),
  { ssr: false }
);
const ComponentGridWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/ComponentGrid.webflow").then(m => m.ComponentGridWrapper),
  { ssr: false }
);
const FooterWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/Footer.webflow").then(m => m.FooterWrapper),
  { ssr: false }
);
const WaitlistSectionWrapper = dynamic(
  () => import("@/src/libraries/webcn/components/WaitlistSection.webflow").then(m => m.WaitlistSectionWrapper),
  { ssr: false }
);

// Waitlist components
const WaitlistCaptureWrapper = dynamic(
  () => import("@/src/libraries/waitlist/components/WaitlistCapture.webflow").then(m => m.WaitlistCaptureWrapper),
  { ssr: false }
);
const WaitlistAdminWrapper = dynamic(
  () => import("@/src/libraries/waitlist/components/WaitlistAdmin.webflow").then(m => m.WaitlistAdminWrapper),
  { ssr: false }
);

// Registry Dashboard components
const RegistryComponentGridWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentGrid.webflow").then(m => m.ComponentGridWrapper),
  { ssr: false }
);
const RegistryDetailHeaderWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow").then(m => m.ComponentDetailHeaderWrapper),
  { ssr: false }
);
const RegistryDetailPreviewWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow").then(m => m.ComponentDetailPreviewWrapper),
  { ssr: false }
);
const RegistryDetailPropsWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentDetailProps.webflow").then(m => m.ComponentDetailPropsWrapper),
  { ssr: false }
);
const RegistryDetailUsageWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow").then(m => m.ComponentDetailUsageWrapper),
  { ssr: false }
);
const RegistryDetailSidebarWrapper = dynamic(
  () => import("@/src/libraries/registry-dashboard/components/ComponentDetailSidebar.webflow").then(m => m.ComponentDetailSidebarWrapper),
  { ssr: false }
);

/**
 * Registry mapping component IDs to their wrapper components
 */
export const componentRegistry: Record<string, ComponentType<any>> = {
  // Core
  "core-login-form": LoginFormWrapper,
  "core-registration-form": RegistrationFormWrapper,
  "core-post-editor": PostEditorWrapper,
  "core-navigation": NavigationWrapper,
  "core-dashboard": DashboardWrapper,
  "core-hello-user": HelloUserWrapper,

  // Analytics
  "analytics-chart-test": ChartTestWrapper,
  "analytics-pie-chart": PieChartDemoWrapper,
  "analytics-bar-chart": BarChartDemoWrapper,

  // Interactive
  "interactive-lanyard": LanyardWrapper,
  "interactive-blue-slider": BlueSliderWrapper,
  "interactive-red-slider": RedSliderWrapper,
  "interactive-laser-flow-hero": LaserFlowHeroWrapper,

  // webcn
  "webcn-navbar": NavbarWrapper,
  "webcn-hero": HeroWrapper,
  "webcn-features": FeaturesWrapper,
  "webcn-component-grid": ComponentGridWrapper,
  "webcn-footer": FooterWrapper,
  "webcn-waitlist-section": WaitlistSectionWrapper,

  // Waitlist
  "waitlist-capture": WaitlistCaptureWrapper,
  "waitlist-admin": WaitlistAdminWrapper,

  // Registry Dashboard
  "registry-component-grid": RegistryComponentGridWrapper,
  "registry-detail-header": RegistryDetailHeaderWrapper,
  "registry-detail-preview": RegistryDetailPreviewWrapper,
  "registry-detail-props": RegistryDetailPropsWrapper,
  "registry-detail-usage": RegistryDetailUsageWrapper,
  "registry-detail-sidebar": RegistryDetailSidebarWrapper,
};

/**
 * Get component wrapper by ID
 */
export function getComponentWrapper(id: string): ComponentType<any> | null {
  return componentRegistry[id] || null;
}
