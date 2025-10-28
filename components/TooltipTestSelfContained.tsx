'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface TooltipTestSelfContainedProps {
  buttonText?: string;
  tooltipText?: string;
}

/**
 * Tooltip Test Component - Self-Contained Provider Pattern
 *
 * This component includes its own TooltipProvider wrapper, making it
 * completely self-contained. Each instance has its own provider context.
 *
 * Tests: Tooltip with self-contained provider in Webflow Shadow DOM
 */
export default function TooltipTestSelfContained({
  buttonText = 'Hover for tooltip',
  tooltipText = 'This tooltip uses its own self-contained provider',
}: TooltipTestSelfContainedProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            Tooltip Test - Self-Contained Provider
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            This component wraps itself with its own TooltipProvider. Each
            instance is independent and self-contained.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">{buttonText}</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">Tooltip 2</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Second tooltip with the same local provider</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Tooltip 3</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Third tooltip also using local provider</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-md max-w-md">
          <p className="text-xs font-mono">Pattern: Self-Contained</p>
          <p className="text-xs font-mono mt-1">
            Provider: Component-level TooltipProvider
          </p>
          <p className="text-xs font-mono mt-1">
            Component: shadcn/ui Tooltip (includes provider)
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
