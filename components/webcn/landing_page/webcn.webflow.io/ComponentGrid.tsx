import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export interface ComponentGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  viewAllButtonText?: string;
}

const components = [
  {
    name: "Button",
    category: "UI",
    description: "Customizable button component with variants",
    preview: "button-preview"
  },
  {
    name: "Form",
    category: "UI",
    description: "Complete form with validation",
    preview: "form-preview"
  },
  {
    name: "Card",
    category: "UI",
    description: "Flexible card component",
    preview: "card-preview"
  },
  {
    name: "Auth Modal",
    category: "Full-Stack",
    description: "Login/Register with backend",
    preview: "auth-preview"
  },
  {
    name: "Data Table",
    category: "Full-Stack",
    description: "Table with CRUD operations",
    preview: "table-preview"
  },
  {
    name: "Image Upload",
    category: "Full-Stack",
    description: "Upload with cloud storage",
    preview: "upload-preview"
  },
  {
    name: "Comment System",
    category: "Full-Stack",
    description: "Real-time comments & replies",
    preview: "comment-preview"
  },
  {
    name: "User Profile",
    category: "Full-Stack",
    description: "Complete user profile editor",
    preview: "profile-preview"
  },
  {
    name: "Dashboard",
    category: "Full-Stack",
    description: "Analytics dashboard template",
    preview: "dashboard-preview"
  }
];

const ComponentGrid = ({
  sectionTitle = "Component Library",
  sectionSubtitle = "Explore our growing collection of production-ready components",
  viewAllButtonText = "View All Components",
}: ComponentGridProps) => {
  return (
    <section id="components" className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {components.map((component, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Preview Area */}
              <div className="aspect-video bg-muted/30 border-b border-border flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-muted-foreground text-sm font-mono relative z-10">
                  {component.preview}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {component.name}
                  </h3>
                  <Badge
                    variant={component.category === "Full-Stack" ? "default" : "secondary"}
                    className={component.category === "Full-Stack"
                      ? "bg-primary text-primary-foreground border-0"
                      : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {component.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {component.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  View Component
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
          >
            {viewAllButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComponentGrid;
