import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getComponentsByLibraryGrouped } from "@/lib/registry-utils";
import type { WebflowCMSLibrary, WebflowCMSComponent } from "@/lib/webflow-cms-types";
import { normalizeCMSArray } from "@/lib/webflow-cms-types";

export interface ComponentGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  viewAllButtonText?: string;
  basePath?: string;
  /** Use path-based URLs (e.g., /path/component-id) instead of query params (e.g., /path?id=component-id) */
  usePaths?: boolean;
  /** Optional CMS libraries data to override registry data */
  cmsLibraries?: WebflowCMSLibrary[];
  /** Optional CMS components data to override registry data */
  cmsComponents?: WebflowCMSComponent[];
}

const ComponentGrid = ({
  sectionTitle = "Component Library",
  sectionSubtitle = "Explore our growing collection of production-ready components",
  viewAllButtonText = "View All Components",
  basePath = "/lander/webcn/component",
  usePaths = false,
  cmsLibraries,
  cmsComponents,
}: ComponentGridProps) => {
  // Get all components grouped by library from registry (fallback)
  const registryGroups = getComponentsByLibraryGrouped();

  // If CMS data is provided, use it to override registry data
  const libraryGroups = cmsLibraries && cmsLibraries.length > 0 ? cmsLibraries.map((cmsLib) => {
    // Find matching registry group for fallback data
    const registryGroup = registryGroups.find(g => g.libraryKey === cmsLib.libraryId);

    // Get components for this library
    const libComponents = cmsComponents?.filter(c => c.libraryId === cmsLib.libraryId) || [];

    return {
      libraryKey: cmsLib.libraryId || cmsLib.slug || 'unknown',
      libraryName: cmsLib.name || registryGroup?.libraryName || 'Unknown Library',
      libraryDescription: cmsLib.description || registryGroup?.libraryDescription || '',
      components: libComponents.map(cmsComp => ({
        id: cmsComp.componentId || cmsComp.slug || 'unknown',
        name: cmsComp.name || cmsComp.componentId || 'Unknown Component',
        description: cmsComp.description || '',
        category: cmsComp.category,
        tags: normalizeCMSArray(cmsComp.tags),
      })),
    };
  }).filter(group => group.components.length > 0) : registryGroups;

  return (
    <section id="components" className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground">{sectionSubtitle}</p>
        </div>

        {/* Components grouped by library */}
        <div className="space-y-16 max-w-7xl mx-auto">
          {libraryGroups.map((group) => (
            <div key={group.libraryKey}>
              {/* Library Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {group.libraryName}
                </h3>
                <p className="text-muted-foreground">
                  {group.libraryDescription}
                </p>
              </div>

              {/* Component Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.components.map((component, index) => {
                  // Generate URL based on usePaths setting
                  const componentUrl = usePaths
                    ? `${basePath}/${component.id}`
                    : `${basePath}?id=${component.id}`;

                  return (
                  <a
                    key={component.id}
                    href={componentUrl}
                    className="block"
                  >
                    <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                      {/* Preview Area */}
                      <div className="aspect-video bg-muted/30 border-b border-border flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="text-muted-foreground text-sm font-mono relative z-10">
                          {component.id}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {component.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground shrink-0"
                          >
                            {component.category || group.libraryKey}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          {component.description}
                        </p>

                        {/* Tags */}
                        {component.tags && component.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {component.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-all"
                            asChild
                          >
                            <span>
                              View Details
                              <ExternalLink className="w-4 h-4" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComponentGrid;
