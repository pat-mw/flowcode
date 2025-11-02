import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DarkVeil from "@/components/react-bits/backgrounds/dark-veil";
import { ArrowRight, Code2, Sparkles } from "lucide-react";

export interface HeroProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  showBadge?: boolean;
  showTechStack?: boolean;
  showBackground?: boolean;
  // DarkVeil background props
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
}

const Hero = ({
  badgeText = "Webflow × Contra Hackathon Entry",
  title = "webcn",
  subtitle = "Full-stack React components for Webflow",
  description = "Leverage Webflow's new code components feature to build production-ready applications. Drop in authentication, databases, and complex UI — all running natively in Webflow.",
  primaryCtaText = "Browse Components",
  primaryCtaUrl = "#components",
  secondaryCtaText = "View Demo",
  secondaryCtaUrl = "#demo",
  showBadge = true,
  showTechStack = true,
  showBackground = true,
  // DarkVeil background defaults
  hueShift = 100,
  noiseIntensity = 0.2,
  scanlineIntensity = 0.4,
  speed = 1.2,
  scanlineFrequency = 0.6,
  warpAmount = 0.4,
  resolutionScale = 1,
}: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* DarkVeil animated background */}
      {showBackground && (
        <div className="absolute inset-0">
          <DarkVeil
            hueShift={hueShift}
            noiseIntensity={noiseIntensity}
            scanlineIntensity={scanlineIntensity}
            speed={speed}
            scanlineFrequency={scanlineFrequency}
            warpAmount={warpAmount}
            resolutionScale={resolutionScale}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Hackathon Badge */}
          {showBadge && (
            <Badge
              variant="outline"
              className="border-primary/50 text-primary bg-primary/10 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-glow-pulse"
            >
              <Sparkles className="w-4 h-4 mr-2 inline" />
              {badgeText}
            </Badge>
          )}

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary">
            {title}
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto font-light">
            {subtitle}
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow transition-all duration-300 hover:scale-105 text-base px-8"
            >
              <a href={primaryCtaUrl}>
                <Code2 className="mr-2 h-5 w-5" />
                {primaryCtaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 text-base px-8"
            >
              <a href={secondaryCtaUrl}>{secondaryCtaText}</a>
            </Button>
          </div>

          {/* Tech Stack */}
          {showTechStack && (
            <div className="pt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                React 18
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                TypeScript
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                Tailwind CSS
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                Webflow Code Components
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
