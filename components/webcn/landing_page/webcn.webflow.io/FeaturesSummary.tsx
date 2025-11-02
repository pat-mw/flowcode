import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, Shield, Code2 } from "lucide-react";

export interface FeaturesSummaryProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const keyFeatures = [
  {
    icon: Blocks,
    title: "Modular",
    description: "Build with reusable, composable components organized in focused libraries. Mix and match exactly what you need.",
  },
  {
    icon: Code2,
    title: "TypeSafe",
    description: "End-to-end type safety from database to UI with TypeScript, Drizzle ORM, and oRPC integration.",
  },
  {
    icon: Shield,
    title: "Authenticated",
    description: "Built-in authentication with Better Auth. User registration, login, and protected routes out of the box.",
  },
];

const FeaturesSummary = ({
  sectionTitle = "Built for Modern Web Development",
  sectionSubtitle = "Everything you need to build production-ready applications in Webflow",
  ctaText = "Explore All Features",
  ctaLink = "/lander/webcn/features",
}: FeaturesSummaryProps) => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {keyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative p-8 bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-glow"
          >
            <a href={ctaLink}>{ctaText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSummary;
