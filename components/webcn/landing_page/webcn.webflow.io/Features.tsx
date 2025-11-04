import { Card } from "@/components/ui/card";
import { Code2, Database, Lock, Zap, Layers, Workflow } from "lucide-react";

export interface FeaturesProps {
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Feature 1 (shadcn/ui Ready)
  feature1Title?: string;
  feature1Description?: string;

  // Feature 2 (Full-Stack Components)
  feature2Title?: string;
  feature2Description?: string;

  // Feature 3 (Authentication Built-in)
  feature3Title?: string;
  feature3Description?: string;

  // Feature 4 (Zero Configuration)
  feature4Title?: string;
  feature4Description?: string;

  // Feature 5 (Composable Architecture)
  feature5Title?: string;
  feature5Description?: string;

  // Feature 6 (Native Webflow Integration)
  feature6Title?: string;
  feature6Description?: string;
}

// Icon mapping (fixed order)
const icons = [Code2, Database, Lock, Zap, Layers, Workflow];

// Default feature data
const defaultFeatures = [
  {
    title: "shadcn/ui Ready",
    description: "All your favorite shadcn components, optimized and ready to drop into Webflow projects."
  },
  {
    title: "Full-Stack Components",
    description: "Pre-built authentication, database connections, and API integrations that just work."
  },
  {
    title: "Authentication Built-in",
    description: "User registration, login, and session management with zero backend configuration."
  },
  {
    title: "Zero Configuration",
    description: "Copy, paste, customize. No build process, no complex setup — just pure React components."
  },
  {
    title: "Composable Architecture",
    description: "Mix and match components to build exactly what you need. From simple to complex."
  },
  {
    title: "Native Webflow Integration",
    description: "Designed specifically for Webflow's code components feature. Seamless integration guaranteed."
  }
];

const Features = ({
  sectionTitle = "More Than Just Components",
  sectionSubtitle = "A complete framework for building production applications in Webflow",
  feature1Title = defaultFeatures[0].title,
  feature1Description = defaultFeatures[0].description,
  feature2Title = defaultFeatures[1].title,
  feature2Description = defaultFeatures[1].description,
  feature3Title = defaultFeatures[2].title,
  feature3Description = defaultFeatures[2].description,
  feature4Title = defaultFeatures[3].title,
  feature4Description = defaultFeatures[3].description,
  feature5Title = defaultFeatures[4].title,
  feature5Description = defaultFeatures[4].description,
  feature6Title = defaultFeatures[5].title,
  feature6Description = defaultFeatures[5].description,
}: FeaturesProps) => {
  // Build features array from props, filtering out empty titles
  const featureData = [
    { title: feature1Title, description: feature1Description },
    { title: feature2Title, description: feature2Description },
    { title: feature3Title, description: feature3Description },
    { title: feature4Title, description: feature4Description },
    { title: feature5Title, description: feature5Description },
    { title: feature6Title, description: feature6Description },
  ];

  // Combine with icons and filter out features with empty/null titles
  const features = featureData
    .map((feature, index) => ({
      icon: icons[index],
      title: feature.title || '',
      description: feature.description || '',
    }))
    .filter(feature => feature.title.trim() !== ''); // Only show features with non-empty titles
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
