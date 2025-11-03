'use client';

import { Eye, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface ComponentDetailPreviewSlotProps {
  componentId?: string;
  previewBaseUrl?: string;
  children?: React.ReactNode; // Slot content (image from Webflow)
}

const ComponentDetailPreviewSlot = ({
  componentId: propComponentId,
  previewBaseUrl = process.env.NEXT_PUBLIC_API_URL,
  children,
}: ComponentDetailPreviewSlotProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  if (!componentId) {
    return (
      <Card className="p-6 bg-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">
            Component Preview
          </h2>
        </div>
        <div className="flex items-center gap-3 p-8 text-muted-foreground justify-center">
          <p>No component ID provided</p>
        </div>
      </Card>
    );
  }

  // Build the preview URL using the provided base URL or environment variable
  const previewUrl = `${previewBaseUrl}/lander/webcn/component?id=${componentId}`;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">
          Component Preview
        </h2>
      </div>

      {/* Preview Area with Slot and Overlay */}
      <div
        className="relative border border-border rounded-lg overflow-hidden min-h-[200px] mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slot content (image from Webflow) */}
        <div className="w-full h-full">
          {children || (
            <div className="bg-muted/20 p-8 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                No preview image provided
              </p>
            </div>
          )}
        </div>

        {/* Hover Overlay (outside the slot) */}
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm
            flex items-center justify-center
            transition-opacity duration-200
            pointer-events-none
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <p className="text-white text-center px-4 text-sm font-medium">
            Live component previews are available on the nextjs site
          </p>
        </div>
      </div>

      {/* Footer with Button */}
      <div className="flex flex-col gap-2">
        <Button asChild variant="default" className="w-full">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <span>View Live Preview</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Component previews are available on the production site to avoid bundle size limitations.
        </p>
      </div>
    </Card>
  );
};

export default ComponentDetailPreviewSlot;
