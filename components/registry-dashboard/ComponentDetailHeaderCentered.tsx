'use client';

import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getComponentById } from "@/lib/registry-utils";
import type { WebflowCMSComponent } from "@/lib/webflow-cms-types";
import { normalizeCMSArray } from "@/lib/webflow-cms-types";

export interface ComponentDetailHeaderCenteredProps {
  componentId?: string;
  /** Optional CMS data to override registry data */
  cmsData?: WebflowCMSComponent;
  /** URL for the "Back to Library" button */
  backToLibraryUrl?: string;
}

const ComponentDetailHeaderCentered = ({
  componentId: propComponentId,
  cmsData,
  backToLibraryUrl = '/lander/webcn',
}: ComponentDetailHeaderCenteredProps) => {
  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || cmsData?.componentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  if (!componentId) {
    return (
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground text-center">No component ID provided</p>
        </div>
      </div>
    );
  }

  // Get registry data (fallback)
  const registryComponent = getComponentById(componentId);

  // Merge CMS data with registry data (CMS takes precedence)
  const component = cmsData ? {
    id: cmsData.componentId || componentId,
    name: cmsData.name || registryComponent?.name || componentId,
    description: cmsData.description || registryComponent?.description || '',
    category: cmsData.category || registryComponent?.category,
    tags: normalizeCMSArray(cmsData.tags) || registryComponent?.tags || [],
    libraryName: registryComponent?.libraryName || 'Unknown Library',
    libraryKey: registryComponent?.libraryKey || 'unknown',
  } : registryComponent;

  if (!component) {
    return (
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center mb-4">
            <Button variant="ghost" size="sm" asChild>
              <a href={backToLibraryUrl}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground text-center">Component not found: {componentId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        {/* Centered "Back to Library" button */}
        <div className="flex justify-center mb-4">
          <Button variant="ghost" size="sm" asChild>
            <a href={backToLibraryUrl}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </a>
          </Button>
        </div>

        {/* Centered title and badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-bold text-foreground text-center">
              {component.name}
            </h1>
            <Badge variant="secondary" className="text-sm">
              {component.libraryName}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl text-center">
            {component.description}
          </p>
        </div>

        {/* Centered tags */}
        {component.tags && component.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {component.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentDetailHeaderCentered;
