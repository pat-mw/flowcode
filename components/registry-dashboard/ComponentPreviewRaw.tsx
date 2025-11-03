'use client';

import { Suspense, Component, ReactNode } from "react";
import { Eye, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getComponentWrapper } from "@/lib/component-registry";

export interface ComponentPreviewRawProps {
  componentId?: string;
}

/**
 * Simple Error Boundary for Component Previews
 */
class PreviewErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Component preview error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ComponentPreviewRaw = ({ componentId: propComponentId }: ComponentPreviewRawProps) => {
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
          <AlertCircle className="w-5 h-5" />
          <p>No component ID provided</p>
        </div>
      </Card>
    );
  }

  const ComponentWrapper = getComponentWrapper(componentId);

  if (!ComponentWrapper) {
    return (
      <Card className="p-6 bg-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">
            Component Preview
          </h2>
        </div>
        <div className="flex items-center gap-3 p-8 text-muted-foreground justify-center">
          <AlertCircle className="w-5 h-5" />
          <p>Preview not available for this component</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">
          Component Preview
        </h2>
      </div>

      {/* Preview Container */}
      <div className="border border-border rounded-lg bg-background p-6 min-h-[200px]">
        <PreviewErrorBoundary
          fallback={
            <div className="flex items-center gap-3 p-8 text-destructive justify-center">
              <AlertCircle className="w-5 h-5" />
              <p>Error loading component preview</p>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <ComponentWrapper />
          </Suspense>
        </PreviewErrorBoundary>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        This is a live preview of the component with default props. Some
        features may require authentication or backend services.
      </p>
    </Card>
  );
};

export default ComponentPreviewRaw;