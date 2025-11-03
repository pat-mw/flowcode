'use client';

import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getComponentById } from "@/lib/registry-utils";

export interface ComponentDetailHeaderProps {
  componentId?: string;
}

const ComponentDetailHeader = ({ componentId: propComponentId }: ComponentDetailHeaderProps) => {
  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  if (!componentId) {
    return (
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground">No component ID provided</p>
        </div>
      </div>
    );
  }

  const component = getComponentById(componentId);

  if (!component) {
    return (
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/lander/webcn">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </a>
          </Button>
          <p className="text-muted-foreground">Component not found: {componentId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <a href="/lander/webcn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </a>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                {component.name}
              </h1>
              <Badge variant="secondary" className="text-sm">
                {component.libraryName}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {component.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {component.tags && component.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
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

export default ComponentDetailHeader;
