"use client";

// Import raw components (NOT Webflow wrappers)
// Wrappers are for Webflow deployment only, not Next.js app usage
import Navbar from "@/components/webcn/landing_page/webcn.webflow.io/Navbar";
import Hero from "@/components/webcn/landing_page/webcn.webflow.io/Hero";
import FeaturesSummary from "@/components/webcn/landing_page/webcn.webflow.io/FeaturesSummary";
import ComponentGrid from "@/components/registry-dashboard/ComponentGrid";
import WaitlistSection from "@/components/webcn/landing_page/webcn.webflow.io/WaitlistSection";
import DemoSection from "@/components/webcn/landing_page/webcn.webflow.io/DemoSection";
import VideoSection from "@/components/webcn/landing_page/webcn.webflow.io/VideoSection";
import StorySection from "@/components/webcn/landing_page/webcn.webflow.io/StorySection";
import BlogCTA from "@/components/webcn/landing_page/webcn.webflow.io/BlogCTA";
import Footer from "@/components/webcn/landing_page/webcn.webflow.io/Footer";

export default function WebcnLandingDemo() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero showBackground={true} />

      {/* Features Summary - High-level overview */}
      <FeaturesSummary />

      {/* Component Grid */}
      <ComponentGrid />

      {/* Waitlist Section (Tests cross-library imports) */}
      <WaitlistSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Video Section */}
      <VideoSection />

      {/* Story Section */}
      <StorySection />

      {/* Blog CTA */}
      <BlogCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
