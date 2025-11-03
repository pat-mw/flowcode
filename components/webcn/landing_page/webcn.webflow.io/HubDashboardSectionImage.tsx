'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Package, Settings } from "lucide-react";

export interface HubDashboardSectionImageProps {
  // Image prop (using Webflow's Image type structure)
  imageSrc?: string; // URL to dashboard screenshot/GIF
  imageAlt?: string; // Alt text for accessibility

  // Existing text props (unchanged)
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  showBadge?: boolean;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature3Title?: string;
  feature3Description?: string;
}

const HubDashboardSectionImage = ({
  imageSrc,
  imageAlt,
  badgeText = "Management Hub",
  sectionTitle = "Control Center for Your Stack",
  sectionSubtitle = "Connect services, install libraries, and configure your backend — all from one dashboard",
  showBadge = true,
  feature1Title = "One-Click Setup",
  feature1Description = "Connect your accounts and deploy in minutes",
  feature2Title = "Modular Libraries",
  feature2Description = "Install only what you need, when you need it",
  feature3Title = "Full Control",
  feature3Description = "Configure every aspect of your deployment",
}: HubDashboardSectionImageProps) => {
  return (
    <section id="hub" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            {showBadge && (
              <Badge className="bg-gradient-primary">
                {badgeText}
              </Badge>
            )}
            <h2 className="text-4xl md:text-5xl font-bold">
              {sectionTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {sectionSubtitle}
            </p>
          </div>

          {/* Dashboard Image Display */}
          <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card p-8 mb-12">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt || "Hub Dashboard"}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No dashboard image provided</p>
              </div>
            )}
          </Card>

          {/* Bottom Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 animate-fade-up">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{feature1Title}</h4>
              <p className="text-sm text-muted-foreground">
                {feature1Description}
              </p>
            </div>

            <div className="text-center p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{feature2Title}</h4>
              <p className="text-sm text-muted-foreground">
                {feature2Description}
              </p>
            </div>

            <div className="text-center p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{feature3Title}</h4>
              <p className="text-sm text-muted-foreground">
                {feature3Description}
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              No complex configuration. No DevOps expertise required. Just connect and deploy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubDashboardSectionImage;
