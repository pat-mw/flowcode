"use client";

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

export default function WebcnLandingDemo() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Navigation */}
      <NavbarWrapper />

      {/* Hero Section */}
      <HeroWrapper showBackground={true} />

      {/* Features Summary - High-level overview */}
      <FeaturesSummaryWrapper />

      {/* Component Grid */}
      <ComponentGridWrapper />

      {/* Waitlist Section (Tests cross-library imports) */}
      <WaitlistSectionWrapper />

      {/* Demo Section */}
      <DemoSectionWrapper />

      {/* Video Section */}
      <VideoSectionWrapper />

      {/* Story Section */}
      <StorySectionWrapper />

      {/* Blog CTA */}
      <BlogCTAWrapper />

      {/* Footer */}
      <FooterWrapper />
    </div>
  );
}
