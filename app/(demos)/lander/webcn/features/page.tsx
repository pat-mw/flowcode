"use client";

import { NavbarWrapper } from "@/src/libraries/webcn/components/Navbar.webflow";
import { FeaturesWrapper } from "@/src/libraries/webcn/components/Features.webflow";
import { StylingControlSectionWrapper } from "@/src/libraries/webcn/components/StylingControlSection.webflow";
import { ArchitectureSectionWrapper } from "@/src/libraries/webcn/components/ArchitectureSection.webflow";
import { HubDashboardSectionWrapper } from "@/src/libraries/webcn/components/HubDashboardSection.webflow";
import { BlogCTAWrapper } from "@/src/libraries/webcn/components/BlogCTA.webflow";
import { FooterWrapper } from "@/src/libraries/webcn/components/Footer.webflow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WebcnFeaturesPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Navigation */}
      <NavbarWrapper />

      {/* Back to Home Link */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="group"
        >
          <a href="/lander/webcn" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </a>
        </Button>
      </div>

      {/* Page Header */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            All Features
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore the complete feature set of our Webflow component library
          </p>
        </div>
      </div>

      {/* Features Grid (existing 6-feature grid) */}
      <FeaturesWrapper />

      {/* Styling Control Section */}
      <StylingControlSectionWrapper />

      {/* Architecture Section */}
      <ArchitectureSectionWrapper />

      {/* Hub Dashboard Section */}
      <HubDashboardSectionWrapper />

      {/* Blog CTA */}
      <BlogCTAWrapper />

      {/* Footer */}
      <FooterWrapper />
    </div>
  );
}
