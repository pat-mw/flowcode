'use client';

import { Package, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getComponentById } from "@/lib/registry-utils";
import type { WebflowCMSComponent } from "@/lib/webflow-cms-types";
import { normalizeCMSArray } from "@/lib/webflow-cms-types";

export interface ComponentDetailSidebarProps {
  componentId?: string;
  /** Optional CMS data to override registry data */
  cmsData?: WebflowCMSComponent;
}

const ComponentDetailSidebar = ({
  componentId: propComponentId,
  cmsData
}: ComponentDetailSidebarProps) => {
  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || cmsData?.componentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  if (!componentId) {
    return null; // Hide if no component ID
  }

  // Get registry data (fallback)
  const registryComponent = getComponentById(componentId);

  // Merge CMS data with registry data (CMS takes precedence)
  const component = cmsData ? {
    category: cmsData.category || registryComponent?.category,
    libraryName: registryComponent?.libraryName || 'Unknown Library',
    libraryKey: registryComponent?.libraryKey || 'unknown',
    dependencies: normalizeCMSArray(cmsData.dependencies) || registryComponent?.dependencies || [],
    backendDependencies: normalizeCMSArray(cmsData.backendDependencies) || registryComponent?.backendDependencies || [],
    filePath: cmsData.filePath || registryComponent?.filePath,
  } : registryComponent;

  if (!component) {
    return null; // Hide if component not found
  }

  return (
    <div className="space-y-6">
      {/* Category */}
      {component.category && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Category
          </h3>
          <Badge variant="secondary" className="text-sm">
            {component.category}
          </Badge>
        </Card>
      )}

      {/* Library */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          Library
        </h3>
        <div className="space-y-2">
          <p className="font-semibold">{component.libraryName}</p>
          <Badge variant="outline" className="font-mono text-xs">
            {component.libraryKey}
          </Badge>
        </div>
      </Card>

      {/* Dependencies */}
      {component.dependencies && component.dependencies.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">
              Dependencies
            </h3>
          </div>
          <ul className="space-y-2">
            {component.dependencies.map((dep) => (
              <li key={dep} className="text-sm">
                <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                  {dep}
                </code>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Backend Dependencies */}
      {component.backendDependencies && component.backendDependencies.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">
              Backend Endpoints
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            This component requires the following backend endpoints:
          </p>
          <ul className="space-y-2">
            {component.backendDependencies.map((endpoint) => (
              <li
                key={endpoint}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
                  {endpoint}
                </code>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* File Path */}
      {component.filePath && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            File Path
          </h3>
          <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
            {component.filePath}
          </code>
        </Card>
      )}
    </div>
  );
};

export default ComponentDetailSidebar;
