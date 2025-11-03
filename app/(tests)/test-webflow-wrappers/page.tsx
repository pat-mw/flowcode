"use client";

/**
 * Webflow Wrappers Test Page
 *
 * This page tests Webflow wrapper components in isolation using STATIC imports only.
 *
 * Purpose:
 * - Verify wrappers work before deploying to Webflow
 * - Test wrapper props configuration
 * - Ensure WebflowProvidersWrapper is working correctly
 * - Validate Shadow DOM compatibility
 *
 * Important:
 * - Uses Webflow wrappers (NOT raw components)
 * - Static imports only (NO dynamic imports)
 * - This is the ONLY Next.js page that should use wrappers
 * - All other pages should use raw components
 */

import { NavbarWrapper } from "@/src/libraries/webcn/components/Navbar.webflow";
import { HeroWrapper } from "@/src/libraries/webcn/components/Hero.webflow";
import { FeaturesSummaryWrapper } from "@/src/libraries/webcn/components/FeaturesSummary.webflow";
import { ComponentGridWrapper } from "@/src/libraries/registry-dashboard/components/ComponentGrid.webflow";
import { WaitlistSectionWrapper } from "@/src/libraries/webcn/components/WaitlistSection.webflow";
import { DemoSectionWrapper } from "@/src/libraries/webcn/components/DemoSection.webflow";
import { VideoSectionWrapper } from "@/src/libraries/webcn/components/VideoSection.webflow";
import { StorySectionWrapper } from "@/src/libraries/webcn/components/StorySection.webflow";
import { BlogCTAWrapper } from "@/src/libraries/webcn/components/BlogCTA.webflow";
import { FooterWrapper } from "@/src/libraries/webcn/components/Footer.webflow";
import { ComponentDetailHeaderWrapper } from "@/src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow";
import { ComponentDetailPreviewWrapper } from "@/src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow";
import { ComponentDetailPropsWrapper } from "@/src/libraries/registry-dashboard/components/ComponentDetailProps.webflow";
import { ComponentDetailUsageWrapper } from "@/src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow";
import { ComponentDetailSidebarWrapper } from "@/src/libraries/registry-dashboard/components/ComponentDetailSidebar.webflow";

export default function TestWebflowWrappersPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-16">
      <header className="border-b pb-6">
        <h1 className="text-4xl font-bold mb-2">Webflow Wrappers Test Page</h1>
        <p className="text-muted-foreground">
          This page tests Webflow wrapper components using static imports.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This is the ONLY Next.js page that should use Webflow wrappers.
            All other pages should use raw components from /components.
          </p>
        </div>
      </header>

      {/* webcn Library Wrappers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">webcn Library Wrappers</h2>

        <div className="space-y-8">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Navbar Wrapper</h3>
            <NavbarWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Hero Wrapper</h3>
            <HeroWrapper showBackground={true} />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Features Summary Wrapper</h3>
            <FeaturesSummaryWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Waitlist Section Wrapper</h3>
            <WaitlistSectionWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Demo Section Wrapper</h3>
            <DemoSectionWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Video Section Wrapper</h3>
            <VideoSectionWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Story Section Wrapper</h3>
            <StorySectionWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Blog CTA Wrapper</h3>
            <BlogCTAWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Footer Wrapper</h3>
            <FooterWrapper />
          </div>
        </div>
      </section>

      {/* registry-dashboard Library Wrappers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">registry-dashboard Library Wrappers</h2>

        <div className="space-y-8">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Grid Wrapper</h3>
            <ComponentGridWrapper />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Detail Header Wrapper</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Testing with componentId=&quot;core-login-form&quot;
            </p>
            <ComponentDetailHeaderWrapper componentId="core-login-form" />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Detail Preview Wrapper</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Testing with componentId=&quot;core-login-form&quot;
            </p>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Expected:</strong> This wrapper will likely fail because it uses dynamic imports internally.
                This is a known limitation - component preview only works with raw components in Next.js.
              </p>
            </div>
            <ComponentDetailPreviewWrapper componentId="core-login-form" />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Detail Props Wrapper</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Testing with componentId=&quot;core-login-form&quot;
            </p>
            <ComponentDetailPropsWrapper componentId="core-login-form" />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Detail Usage Wrapper</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Testing with componentId=&quot;core-login-form&quot;
            </p>
            <ComponentDetailUsageWrapper componentId="core-login-form" />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Component Detail Sidebar Wrapper</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Testing with componentId=&quot;core-login-form&quot;
            </p>
            <ComponentDetailSidebarWrapper componentId="core-login-form" />
          </div>
        </div>
      </section>

      {/* Test Results Summary */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Test Checklist</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input type="checkbox" id="wrappers-render" className="mt-1" />
            <label htmlFor="wrappers-render" className="text-sm">
              All wrappers render without errors
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="props-work" className="mt-1" />
            <label htmlFor="props-work" className="text-sm">
              Props (like componentId, showBackground) work correctly
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="styling" className="mt-1" />
            <label htmlFor="styling" className="text-sm">
              Tailwind CSS styling applies correctly (WebflowProvidersWrapper working)
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="no-console-errors" className="mt-1" />
            <label htmlFor="no-console-errors" className="text-sm">
              No console errors in browser devtools
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="ready-deploy" className="mt-1" />
            <label htmlFor="ready-deploy" className="text-sm">
              Ready to deploy to Webflow
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
