"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ComponentDetailHeader from "@/components/registry-dashboard/ComponentDetailHeader";
import ComponentDetailProps from "@/components/registry-dashboard/ComponentDetailProps";
import ComponentDetailUsage from "@/components/registry-dashboard/ComponentDetailUsage";
import ComponentDetailSidebar from "@/components/registry-dashboard/ComponentDetailSidebar";
import { getComponentById } from "@/lib/registry-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ComponentPreviewRaw from "@/components/registry-dashboard/ComponentPreviewRaw";

function ComponentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  const component = id ? getComponentById(id) : null;

  if (!component) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Component Not Found
          </h1>
          <p className="text-muted-foreground">
            The component you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <a href="/lander/webcn">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ComponentDetailHeader componentId={id} />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Component Preview */}
            {/* <ComponentDetailPreview componentId={id} /> */}
            <ComponentPreviewRaw componentId={id} />

            {/* Usage Example */}
            <ComponentDetailUsage componentId={id} />

            {/* Props Documentation */}
            <ComponentDetailProps componentId={id} />
          </div>

          {/* Sidebar */}
          <div>
            <ComponentDetailSidebar componentId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComponentDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ComponentDetailContent />
    </Suspense>
  );
}
