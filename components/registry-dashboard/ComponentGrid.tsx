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
import { HighlightedText } from "@/components/uzo/text/highlighted-text";

export interface ComponentGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  viewAllButtonText?: string;
  basePath?: string;
  /** Use path-based URLs (e.g., /path/component-id) instead of query params (e.g., /path?id=component-id) */
  usePaths?: boolean;
  /** Show the filter by tags section */
  showFilterByTags?: boolean;
  /** Optional CMS libraries data to override registry data */
  cmsLibraries?: WebflowCMSLibrary[];
  /** Optional CMS components data to override registry data */
  cmsComponents?: WebflowCMSComponent[];
}

const ComponentGrid = ({
  sectionTitle = "Component Library",
  sectionSubtitle = "Explore our growing collection of production-ready components",
  basePath = "/lander/webcn/component",
  usePaths = false,
  showFilterByTags = false,
  cmsLibraries,
  cmsComponents,
}: ComponentGridProps) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  // Tag filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Extract all unique tags from all components
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allLibraryGroups.forEach((group) => {
      group.components.forEach((component) => {
        component.tags?.forEach((tag) => tagSet.add(tag));
      });
    });
    return Array.from(tagSet).sort();
  }, [allLibraryGroups]);

  // Filter components based on search query and selected tags
  const filteredLibraryGroups = useMemo(() => {
    const hasSearch = searchQuery.trim() !== '';
    const hasTags = selectedTags.length > 0;

    // If no filters, return all
    if (!hasSearch && !hasTags) return allLibraryGroups;

    const lowerQuery = searchQuery.toLowerCase();

    return allLibraryGroups
      .map((group) => ({
        ...group,
        components: group.components.filter((component) => {
          // Search query matching
          let matchesSearch = true;
          if (hasSearch) {
            const matchesName = component.name.toLowerCase().includes(lowerQuery);
            const matchesDescription = component.description?.toLowerCase().includes(lowerQuery) ?? false;
            const matchesId = component.id.toLowerCase().includes(lowerQuery);
            const matchesCategory = component.category?.toLowerCase().includes(lowerQuery) ?? false;
            const matchesTags = component.tags?.some((tag) =>
              tag.toLowerCase().includes(lowerQuery)
            ) ?? false;
            matchesSearch = matchesName || matchesDescription || matchesId || matchesCategory || matchesTags;
          }

          // Tag filter matching (component must have ALL selected tags)
          let matchesTags = true;
          if (hasTags) {
            matchesTags = selectedTags.every((selectedTag) =>
              component.tags?.includes(selectedTag)
            );
          }

          return matchesSearch && matchesTags;
        }),
      }))
      .filter((group) => group.components.length > 0);
  }, [allLibraryGroups, searchQuery, selectedTags]);

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
        <div className="max-w-3xl mx-auto mb-12 space-y-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              placeholder="Search components by name, description, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base flex-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tag Filter */}
          {showFilterByTags && allTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-foreground">Filter by tags:</p>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results count */}
          {(searchQuery || selectedTags.length > 0) && (
            <p className="text-sm text-muted-foreground text-center">
              Found {totalComponents} component{totalComponents !== 1 ? 's' : ''}
              {selectedTags.length > 0 && (
                <span> with tag{selectedTags.length !== 1 ? 's' : ''}: {selectedTags.join(', ')}</span>
              )}
            </p>
          )}
        </div>

        {/* Components grouped by library */}
        {filteredLibraryGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No components found
              {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
              {selectedTags.length > 0 && (
                <> with tag{selectedTags.length !== 1 ? 's' : ''}: {selectedTags.join(', ')}</>
              )}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedTags([])}
                >
                  Clear Tags
                </Button>
              )}
            </div>
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
                {group.components.map((component) => {
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
                            <HighlightedText text={component.name} highlight={searchQuery} />
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground shrink-0 text-xs"
                          >
                            {component.category || group.libraryKey}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          <HighlightedText text={component.description || ""} highlight={searchQuery} />
                        </p>

                        {/* Tags */}
                        {component.tags && component.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {component.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                <HighlightedText text={tag} highlight={searchQuery} />
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
