'use client';

import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getComponentById } from "@/lib/registry-utils";

export interface ComponentDetailUsageProps {
  componentId?: string;
}

const ComponentDetailUsage = ({ componentId: propComponentId }: ComponentDetailUsageProps) => {
  const [copied, setCopied] = useState(false);

  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!componentId) {
    return null; // Hide if no component ID
  }

  const component = getComponentById(componentId);

  if (!component || !component.usageExample) {
    return null; // Hide if no usage example
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">
            Usage
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(component.usageExample!)}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code className="text-sm font-mono">
          {component.usageExample}
        </code>
      </pre>
    </Card>
  );
};

export default ComponentDetailUsage;
