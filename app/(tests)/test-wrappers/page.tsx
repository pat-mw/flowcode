"use client";

// Direct implementation imports
import { DialogTestDefaultWrapper } from "@/src/components/DialogTestDefault.webflow";
import { DialogTestWrappedWrapper } from "@/src/components/DialogTestWrapped.webflow";
import { TooltipTestSharedWrapper } from "@/src/components/TooltipTestShared.webflow";
import { TooltipTestSelfContainedWrapper } from "@/src/components/TooltipTestSelfContained.webflow";
import { PopoverTestDefaultWrapper } from "@/src/components/PopoverTestDefault.webflow";
import { PopoverTestControlledWrapper } from "@/src/components/PopoverTestControlled.webflow";
import { ToastTestWrapper } from "@/src/components/ToastTest.webflow";
import { NavigationWrapper } from "@/src/components/Navigation.webflow";

export default function TestWrappersPage() {
  return (
    <div className="min-h-screen flex flex-col w-screen">
      <NavigationWrapper
        brandName="BlogFlow"
        homeUrl="/"
        showAuthButtons={true}
        loginUrl="/login"
        registerUrl="/register"
        variant="default"
      />

      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Webflow Component Test Suite
          </h1>
          <p className="text-muted-foreground">
            Test shadcn components with different provider patterns for Webflow
            Code Components. All components are wrapped with
            WebflowProvidersWrapper to simulate Webflow Shadow DOM environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DialogTestDefaultWrapper
            title="Dialog Test - Default"
            description="This dialog uses the default pattern (self-contained)"
            buttonText="Open Dialog"
          />
          <DialogTestWrappedWrapper
            title="Dialog Test - Wrapped"
            description="This dialog uses the wrapped pattern (shared)"
            buttonText="Open Dialog"
          />
          <TooltipTestSharedWrapper
            buttonText="Hover for Tooltip"
            tooltipText="This tooltip uses the shared pattern (shared)"
          />
          <TooltipTestSelfContainedWrapper
            buttonText="Hover for Tooltip"
            tooltipText="This tooltip uses the self-contained pattern (self-contained)"
          />
          <PopoverTestDefaultWrapper
            buttonText="Open Popover"
            title="Popover Test - Default"
          />
          <PopoverTestControlledWrapper
            buttonText="Open Popover"
            title="Popover Test - Controlled"
          />
          <ToastTestWrapper
            buttonText="Show Toast"
            toastMessage="This is a toast notification"
          />
        </div>
      </div>
    </div>
  );
}
