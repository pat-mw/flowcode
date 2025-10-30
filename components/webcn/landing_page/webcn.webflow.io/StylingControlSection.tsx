'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, Code2, Wand2 } from "lucide-react";

export interface StylingControlSectionProps {
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

const StylingControlSection = ({
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
}: StylingControlSectionProps) => {
  const [activeTheme, setActiveTheme] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const themes = [
    { name: "Default", primary: "hsl(262, 83%, 58%)", accent: "hsl(280, 100%, 70%)" },
    { name: "Ocean", primary: "hsl(200, 100%, 50%)", accent: "hsl(180, 100%, 50%)" },
    { name: "Forest", primary: "hsl(140, 80%, 45%)", accent: "hsl(100, 70%, 50%)" },
    { name: "Sunset", primary: "hsl(25, 100%, 55%)", accent: "hsl(340, 100%, 60%)" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setActiveTheme((prev) => (prev + 1) % themes.length);
      setTimeout(() => setIsAnimating(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [themes.length]);

  const currentTheme = themes[activeTheme];

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
            {/* Left: Visual Demo */}
            <div className="order-2 lg:order-1">
              <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card p-8">
                {/* Theme Preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">LIVE THEME PREVIEW</h4>
                    <Badge variant="outline" className="text-xs">
                      {currentTheme.name}
                    </Badge>
                  </div>

                  {/* Mock Component Preview with Dynamic Theme */}
                  <div
                    className="p-6 rounded-lg border transition-all duration-500"
                    style={{
                      backgroundColor: `${currentTheme.primary}10`,
                      borderColor: `${currentTheme.primary}30`,
                    }}
                  >
                    <div className="space-y-4">
                      <div
                        className="h-8 rounded-lg transition-all duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                        }}
                      ></div>
                      <div className="space-y-2">
                        <div
                          className="h-3 rounded w-full transition-all duration-500"
                          style={{ backgroundColor: `${currentTheme.primary}40` }}
                        ></div>
                        <div
                          className="h-3 rounded w-4/5 transition-all duration-500"
                          style={{ backgroundColor: `${currentTheme.primary}30` }}
                        ></div>
                        <div
                          className="h-3 rounded w-3/5 transition-all duration-500"
                          style={{ backgroundColor: `${currentTheme.primary}20` }}
                        ></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <div
                          className="h-10 flex-1 rounded transition-all duration-500"
                          style={{ backgroundColor: currentTheme.primary }}
                        ></div>
                        <div
                          className="h-10 flex-1 rounded transition-all duration-500"
                          style={{ backgroundColor: currentTheme.accent }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selector Pills */}
                  <div className="flex gap-2 justify-center pt-4">
                    {themes.map((theme, index) => (
                      <button
                        key={theme.name}
                        onClick={() => {
                          setIsAnimating(true);
                          setActiveTheme(index);
                          setTimeout(() => setIsAnimating(false), 300);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeTheme ? 'scale-125' : 'scale-100 opacity-50'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        }}
                        aria-label={`Select ${theme.name} theme`}
                      />
                    ))}
                  </div>

                  {/* Code Snippet */}
                  <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border/30">
                    <code className="text-xs text-muted-foreground font-mono">
                      <div>--color-primary: {currentTheme.primary};</div>
                      <div>--color-accent: {currentTheme.accent};</div>
                    </code>
                  </div>
                </div>

                {/* Animated particles */}
                <div className={`absolute top-4 right-4 transition-all duration-300 ${isAnimating ? 'scale-125 rotate-180' : 'scale-100'}`}>
                  <Wand2 className="w-6 h-6 text-primary opacity-50" />
                </div>
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

export default StylingControlSection;
