'use client';

import { ComponentDetailPreviewSlotWrapper } from "@/src/libraries/registryDashboard/components/ComponentDetailPreviewSlot.webflow";

export default function TestRegistryPreviewPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Registry Preview Components Test</h1>
          <p className="text-muted-foreground">
            Testing both the original and new slot-based component preview cards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Slot Version */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Slot Version (New)</h2>
              <p className="text-sm text-muted-foreground">
                Accepts custom image via slot, button in footer, hover overlay
              </p>
            </div>
            <ComponentDetailPreviewSlotWrapper
              componentId="core-login-form"
              previewBaseUrl="https://blogflow-three.vercel.app"
            >
              {/* Simulated image content that would come from Webflow */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-12 flex items-center justify-center min-h-[300px]">
                <div className="text-white text-center space-y-2">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-xl font-semibold">Preview Image Slot</p>
                  <p className="text-sm opacity-90">
                    In Webflow, drop an image here
                  </p>
                  <p className="text-xs opacity-75 mt-4">
                    Hover to see overlay
                  </p>
                </div>
              </div>
            </ComponentDetailPreviewSlotWrapper>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="border border-border rounded-lg p-6 bg-muted/20">
          <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-foreground">Original Version:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Static placeholder text</li>
                <li>✓ Button in preview area</li>
                <li>✓ Fixed layout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-foreground">Slot Version:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Custom image via slot</li>
                <li>✓ Button in footer</li>
                <li>✓ Hover overlay with message</li>
                <li>✓ Flexible content insertion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="border border-border rounded-lg p-6 bg-muted/20">
          <h3 className="text-lg font-semibold mb-4">Webflow Usage Instructions</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Setting up the Slot Version:</h4>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Drag &quot;Component Detail Preview (Slot)&quot; onto your page</li>
                <li>Set the Component ID (e.g., &quot;core-login-form&quot;)</li>
                <li>Set the Preview Base URL (your site URL)</li>
                <li>Click the &quot;Preview Image&quot; slot in the properties panel</li>
                <li>Drop an image element into the highlighted slot area</li>
                <li>The image will appear in the preview card</li>
                <li>Hover over the preview to see the overlay message</li>
                <li>Button is automatically positioned in the footer</li>
              </ol>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs">
                <strong>Note:</strong> The slot replaces the entire preview area div.
                Any content you drop into the slot (images, components, etc.) will be rendered there.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
