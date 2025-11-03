'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Code2 } from "lucide-react";

export interface StylingControlSectionImageProps {
  // Image prop
  imageUrl?: string; // URL to GIF or static image

  // Existing text props (unchanged)
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature3Title?: string;
  feature3Description?: string;
  showBadge?: boolean;
}

const StylingControlSectionImage = ({
  imageUrl,
  badgeText = "Design System",
  sectionTitle = "Complete Styling Control",
  sectionSubtitle = "Full design system integration with shadcn/ui core tokens and libraries like tweakcn",
  feature1Title = "CSS Variables",
  feature1Description = "All components use CSS custom properties that automatically adapt to your design system. Change once, update everywhere.",
  feature2Title = "shadcn/ui Compatible",
  feature2Description = "Built on the same design tokens as shadcn/ui. Drop in any shadcn component and it just works with your theme.",
  feature3Title = "tweakcn Ready",
  feature3Description = "Fully compatible with tweakcn and other design tools. Adjust colors, spacing, and typography with zero code changes.",
  showBadge = true,
}: StylingControlSectionImageProps) => {
  return (
    <section id="styling" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent"></div>

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

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left: Image Display */}
            <div className="order-2 lg:order-1">
              <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card p-8">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Styling demo"
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No image provided</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Features */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4 animate-fade-up">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature1Title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature1Description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature2Title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature2Description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature3Title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature3Description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Works seamlessly with your existing design system. No configuration required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StylingControlSectionImage;
