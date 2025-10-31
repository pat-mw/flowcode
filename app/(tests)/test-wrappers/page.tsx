"use client";

import { NavigationWrapper } from "@/src/libraries/core/components/Navigation.webflow";
import { ChartTestWrapper } from "@/src/libraries/analytics/components/ChartTest.webflow";
import { HeroWrapper } from "@/src/libraries/webcn/components/Hero.webflow";

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
            Testing available components from the multi-library system (core, analytics, interactive).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <ChartTestWrapper
              title="Blog Engagement Analytics"
              description="Monthly views, likes, and comments for your blog posts"
              ctaText="View Full Report"
              ctaUrl="#analytics"
              showLegend={true}
            />
          </div>
        </div>


        {/* WebCN Hero */}
        <div>
          <HeroWrapper
            title="WebCN Hero"
            description="This is a test of the WebCN Hero component"
          />
        </div>
      </div>
    </div>
  );
}
