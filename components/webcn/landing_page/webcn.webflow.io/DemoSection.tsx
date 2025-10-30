import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, FileText, Lock, Database } from "lucide-react";

export interface DemoSectionProps {
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  demoTitle?: string;
  demoDescription?: string;
  ctaButtonText?: string;
  showBadge?: boolean;
}

const DemoSection = ({
  badgeText = "Live Demo",
  sectionTitle = "See It In Action",
  sectionSubtitle = "blogflow: A full-stack collaborative blog built entirely with webcn components",
  demoTitle = "blogflow",
  demoDescription = "A fully functional blogging platform showcasing the power of webcn. Users can register, authenticate, create posts, and collaborate — all running natively within Webflow using code components.",
  ctaButtonText = "Try blogflow Demo",
  showBadge = true,
}: DemoSectionProps) => {
  return (
    <section id="demo" className="py-24 px-4 relative overflow-hidden">
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

          {/* Demo Card */}
          <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card">
            <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Left: Description */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold mb-4">{demoTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {demoDescription}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">User Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete auth flow with registration, login, and session management
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Blog Post Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Create, edit, and publish posts with rich text editing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Database className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Real-time Database</h4>
                      <p className="text-sm text-muted-foreground">
                        All data persisted and synced in real-time
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Secure & Private</h4>
                      <p className="text-sm text-muted-foreground">
                        Row-level security and user permissions built-in
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    {ctaButtonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg bg-secondary/50 border border-border/50 overflow-hidden relative">
                  {/* Mock browser window */}
                  <div className="h-8 bg-secondary border-b border-border/50 flex items-center gap-2 px-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/50"></div>
                      <div className="w-3 h-3 rounded-full bg-accent/50"></div>
                      <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                    </div>
                    <div className="flex-1 text-center text-xs text-muted-foreground">
                      blogflow.webflow.io
                    </div>
                  </div>
                  
                  {/* Mock content */}
                  <div className="p-6 space-y-4">
                    <div className="h-8 bg-gradient-primary rounded w-1/3 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-full"></div>
                      <div className="h-4 bg-muted/50 rounded w-5/6"></div>
                      <div className="h-4 bg-muted/50 rounded w-4/6"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="h-20 bg-muted/30 rounded border border-border/30"></div>
                      <div className="h-20 bg-muted/30 rounded border border-border/30"></div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4">
                  <Badge className="bg-gradient-primary shadow-glow text-base px-4 py-2">
                    Full-Stack
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              No external services. No API keys. No deployment hassles. Just pure Webflow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
