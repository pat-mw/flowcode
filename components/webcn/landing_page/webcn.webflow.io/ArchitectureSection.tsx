'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Boxes,
  Database,
  Server,
  Shield,
  HardDrive,
  ArrowRight,
  Layers,
  Cloud,
  Lock
} from "lucide-react";

export interface ArchitectureSectionProps {
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  showBadge?: boolean;
}

const ArchitectureSection = ({
  badgeText = "Architecture",
  sectionTitle = "Enterprise-Grade Full-Stack Architecture",
  sectionSubtitle = "From Webflow to database, built with security and scalability in mind",
  showBadge = true,
}: ArchitectureSectionProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const architectureLayers = [
    {
      id: 1,
      icon: Boxes,
      title: "Webflow Components",
      subtitle: "Shadow DOM",
      description: "React components isolated in Shadow DOM for encapsulation",
      color: "primary",
    },
    {
      id: 2,
      icon: HardDrive,
      title: "localStorage",
      subtitle: "State Sync",
      description: "Cross-component communication & state persistence",
      color: "accent",
    },
    {
      id: 3,
      icon: Shield,
      title: "Better Auth",
      subtitle: "Bearer Tokens",
      description: "Secure authentication with JWT bearer tokens",
      color: "primary",
    },
    {
      id: 4,
      icon: Server,
      title: "Next.js Backend",
      subtitle: "Serverless API",
      description: "Serverless functions hosted on Vercel",
      color: "accent",
    },
    {
      id: 5,
      icon: Database,
      title: "Database",
      subtitle: "Configurable",
      description: "Vercel Postgres, Supabase, or Neon",
      color: "primary",
    },
  ];

  return (
    <section id="architecture" className="py-24 px-4 relative overflow-hidden border-t border-border/50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5"></div>

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

          {/* Architecture Diagram */}
          <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card p-8 md:p-12">
            {/* Vertical Flow for Mobile, Horizontal for Desktop */}
            <div className="space-y-8">
              {/* Desktop View - Horizontal Flow */}
              <div className="hidden md:flex items-center justify-between gap-4">
                {architectureLayers.map((layer, index) => (
                  <div key={layer.id} className="flex items-center flex-1">
                    {/* Layer Card */}
                    <div
                      className={`flex-1 transition-all duration-500 ${
                        index === activeStep
                          ? 'scale-105 opacity-100'
                          : 'scale-100 opacity-60'
                      }`}
                    >
                      <div className={`p-6 rounded-lg border-2 transition-all duration-500 ${
                        index === activeStep
                          ? 'border-primary bg-primary/5 shadow-glow'
                          : 'border-border/30 bg-secondary/20'
                      }`}>
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-500 ${
                            index === activeStep
                              ? 'bg-primary/20 scale-110'
                              : 'bg-primary/10'
                          }`}>
                            <layer.icon className={`w-7 h-7 transition-all duration-500 ${
                              index === activeStep ? 'text-primary' : 'text-primary/60'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{layer.title}</h4>
                            <p className="text-xs text-muted-foreground">{layer.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {index < architectureLayers.length - 1 && (
                      <div className="px-2">
                        <ArrowRight
                          className={`w-6 h-6 transition-all duration-500 ${
                            index === activeStep
                              ? 'text-primary scale-125 animate-pulse'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile View - Vertical Flow */}
              <div className="md:hidden space-y-4">
                {architectureLayers.map((layer, index) => (
                  <div key={layer.id}>
                    <div
                      className={`p-5 rounded-lg border-2 transition-all duration-500 ${
                        index === activeStep
                          ? 'border-primary bg-primary/5 shadow-glow scale-105'
                          : 'border-border/30 bg-secondary/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          index === activeStep ? 'bg-primary/20' : 'bg-primary/10'
                        }`}>
                          <layer.icon className={`w-6 h-6 ${
                            index === activeStep ? 'text-primary' : 'text-primary/60'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-0.5">{layer.title}</h4>
                          <p className="text-xs text-muted-foreground">{layer.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    {index < architectureLayers.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight
                          className={`w-5 h-5 rotate-90 transition-all duration-500 ${
                            index === activeStep
                              ? 'text-primary animate-pulse'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Layer Description */}
              <div className="pt-8 border-t border-border/50">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const ActiveIcon = architectureLayers[activeStep].icon;
                        return <ActiveIcon className="w-4 h-4 text-primary" />;
                      })()}
                    </div>
                    <h3 className="font-semibold text-lg">
                      {architectureLayers[activeStep].title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {architectureLayers[activeStep].description}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg border border-border/50 bg-secondary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Secure by Default</h4>
              <p className="text-sm text-muted-foreground">
                JWT bearer tokens, secure session management, and encrypted communication
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-secondary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Modular Design</h4>
              <p className="text-sm text-muted-foreground">
                Each layer is independently configurable and replaceable
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-secondary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Cloud className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Serverless Ready</h4>
              <p className="text-sm text-muted-foreground">
                Deploy to Vercel, Netlify, or any serverless platform instantly
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Production-ready architecture that scales from prototype to enterprise
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
