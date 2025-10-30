import { Card } from "@/components/ui/card";
import { Code2, Database, Lock, Zap, Layers, Workflow } from "lucide-react";

export interface FeaturesProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const features = [
  {
    icon: Code2,
    title: "shadcn/ui Ready",
    description: "All your favorite shadcn components, optimized and ready to drop into Webflow projects."
  },
  {
    icon: Database,
    title: "Full-Stack Components",
    description: "Pre-built authentication, database connections, and API integrations that just work."
  },
  {
    icon: Lock,
    title: "Authentication Built-in",
    description: "User registration, login, and session management with zero backend configuration."
  },
  {
    icon: Zap,
    title: "Zero Configuration",
    description: "Copy, paste, customize. No build process, no complex setup — just pure React components."
  },
  {
    icon: Layers,
    title: "Composable Architecture",
    description: "Mix and match components to build exactly what you need. From simple to complex."
  },
  {
    icon: Workflow,
    title: "Native Webflow Integration",
    description: "Designed specifically for Webflow's code components feature. Seamless integration guaranteed."
  }
];

const Features = ({
  sectionTitle = "More Than Just Components",
  sectionSubtitle = "A complete framework for building production applications in Webflow",
}: FeaturesProps) => {
  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
