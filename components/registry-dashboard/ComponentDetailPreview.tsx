'use client';

import { Eye, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ComponentDetailPreviewProps {
  componentId?: string;
  previewBaseUrl?: string;
}

const ComponentDetailPreview = ({
  componentId: propComponentId,
  previewBaseUrl = process.env.NEXT_PUBLIC_API_URL,
}: ComponentDetailPreviewProps) => {
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
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">
          Component Preview
        </h2>
      </div>

      {/* Preview Placeholder */}
      <div className="border border-border rounded-lg bg-muted/20 p-8 min-h-[200px] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-center">
          Live component previews available on the hosted site
        </p>
        <Button asChild variant="default">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span>View Live Preview</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Component previews are available on the production site to avoid bundle size limitations.
        Click the button above to view the live preview with default props.
      </p>
    </Card>
  );
};

export default ComponentDetailPreview;
