'use client';

import { FileCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getComponentById } from "@/lib/registry-utils";
import type { WebflowCMSComponent } from "@/lib/webflow-cms-types";

export interface ComponentDetailPropsProps {
  componentId?: string;
  /** Optional CMS data to override registry data */
  cmsData?: WebflowCMSComponent;
}

const ComponentDetailProps = ({
  componentId: propComponentId,
  cmsData
}: ComponentDetailPropsProps) => {
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
  // Props come from CMS if provided, otherwise from registry
  const component = cmsData ? {
    props: cmsData.props || registryComponent?.props || [],
  } : registryComponent;

  if (!component || !component.props || component.props.length === 0) {
    return null; // Hide if no props to display
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileCode className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">
          Props
        </h2>
      </div>
      <div className="space-y-4">
        {component.props.map((prop) => (
          <div
            key={prop.name}
            className="border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">
                  {prop.name}
                </code>
                <Badge
                  variant={prop.required ? "default" : "secondary"}
                  className="text-xs"
                >
                  {prop.required ? "Required" : "Optional"}
                </Badge>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {prop.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {prop.description}
            </p>
            {prop.defaultValue !== undefined && (
              <div className="text-xs text-muted-foreground">
                Default:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded">
                  {typeof prop.defaultValue === "string"
                    ? `"${prop.defaultValue}"`
                    : JSON.stringify(prop.defaultValue)}
                </code>
              </div>
            )}
            {prop.options && prop.options.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                Options:{" "}
                {prop.options.map((opt, i) => (
                  <span key={opt.value}>
                    <code className="bg-muted px-1.5 py-0.5 rounded">
                      {opt.value}
                    </code>
                    {i < prop.options!.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ComponentDetailProps;
