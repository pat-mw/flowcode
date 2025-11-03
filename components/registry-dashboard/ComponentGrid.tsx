'use client';

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, X } from "lucide-react";
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
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Get all components grouped by library from registry (fallback)
  const registryGroups = getComponentsByLibraryGrouped();

  // If CMS data is provided, use it to override registry data
  const allLibraryGroups = cmsLibraries && cmsLibraries.length > 0 ? cmsLibraries.map((cmsLib) => {
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
        previewImage: cmsComp.previewImage, // Include preview image if available
      })),
    };
  }).filter(group => group.components.length > 0) : registryGroups;

  // Filter components based on search query
  const filteredLibraryGroups = useMemo(() => {
    if (!searchQuery.trim()) return allLibraryGroups;

    const lowerQuery = searchQuery.toLowerCase();

    return allLibraryGroups
      .map((group) => ({
        ...group,
        components: group.components.filter((component) => {
          const matchesName = component.name.toLowerCase().includes(lowerQuery);
          const matchesDescription = component.description?.toLowerCase().includes(lowerQuery);
          const matchesId = component.id.toLowerCase().includes(lowerQuery);
          const matchesCategory = component.category?.toLowerCase().includes(lowerQuery);
          const matchesTags = component.tags?.some((tag) =>
            tag.toLowerCase().includes(lowerQuery)
          );

          return matchesName || matchesDescription || matchesId || matchesCategory || matchesTags;
        }),
      }))
      .filter((group) => group.components.length > 0);
  }, [allLibraryGroups, searchQuery]);

  // Calculate total components count
  const totalComponents = filteredLibraryGroups.reduce(
    (sum, group) => sum + group.components.length,
    0
  );

  return (
    <section id="components" className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground">{sectionSubtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search components by name, description, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Found {totalComponents} component{totalComponents !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Components grouped by library */}
        {filteredLibraryGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No components found matching "{searchQuery}"
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-16 max-w-7xl mx-auto">
            {filteredLibraryGroups.map((group) => (
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

                  // Check if component has a preview image
                  const hasPreviewImage = component.previewImage && component.previewImage.trim() !== '';

                  return (
                  <a
                    key={component.id}
                    href={componentUrl}
                    className="block"
                  >
                    <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                      {/* Preview Area - Only show if image exists */}
                      {hasPreviewImage && (
                        <div className="aspect-video bg-muted/30 border-b border-border flex items-center justify-center relative overflow-hidden">
                          <img
                            src={component.previewImage}
                            alt={component.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}

                      {/* Content */}
                      <div className={hasPreviewImage ? "p-6 space-y-3" : "p-5 space-y-2.5"}>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold text-foreground group-hover:text-primary transition-colors ${
                            hasPreviewImage ? "text-xl" : "text-lg"
                          }`}>
                            {component.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground shrink-0 text-xs"
                          >
                            {component.category || group.libraryKey}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          {component.description}
                        </p>

                        {/* Tags */}
                        {component.tags && component.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
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
        )}
      </div>
    </section>
  );
};

export default ComponentGrid;
