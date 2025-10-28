'use client';

import { Button } from '@/components/ui/button';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export interface TooltipTestSharedProps {
  buttonText?: string;
  tooltipText?: string;
}

/**
 * Tooltip Test Component - Shared Provider Pattern
 *
 * This component uses the TooltipProvider from WebflowProvidersWrapper.
 * It directly uses Radix UI primitives instead of the shadcn Tooltip wrapper
 * to avoid the auto-included provider.
 *
 * Tests: Tooltip with shared provider from WebflowProvidersWrapper
 */
export default function TooltipTestShared({
  buttonText = 'Hover for tooltip',
  tooltipText = 'This tooltip uses the shared provider from WebflowProvidersWrapper',
}: TooltipTestSharedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Tooltip Test - Shared Provider</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This component relies on the TooltipProvider from WebflowProvidersWrapper.
          Multiple instances will share the same provider context.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            <Button variant="outline">{buttonText}</Button>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              sideOffset={5}
              className={cn(
                'bg-foreground text-background animate-in fade-in-0 zoom-in-95',
                'z-50 rounded-md px-3 py-1.5 text-xs max-w-xs'
              )}
            >
              {tooltipText}
              <TooltipPrimitive.Arrow className="fill-foreground" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>

        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            <Button variant="secondary">Tooltip 2</Button>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              sideOffset={5}
              className={cn(
                'bg-foreground text-background animate-in fade-in-0 zoom-in-95',
                'z-50 rounded-md px-3 py-1.5 text-xs max-w-xs'
              )}
            >
              Second tooltip sharing the same provider
              <TooltipPrimitive.Arrow className="fill-foreground" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>

        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            <Button>Tooltip 3</Button>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              sideOffset={5}
              className={cn(
                'bg-foreground text-background animate-in fade-in-0 zoom-in-95',
                'z-50 rounded-md px-3 py-1.5 text-xs max-w-xs'
              )}
            >
              Third tooltip also sharing the provider
              <TooltipPrimitive.Arrow className="fill-foreground" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-md max-w-md">
        <p className="text-xs font-mono">Pattern: Shared Provider</p>
        <p className="text-xs font-mono mt-1">
          Provider: WebflowProvidersWrapper
        </p>
        <p className="text-xs font-mono mt-1">Component: @radix-ui/react-tooltip</p>
      </div>
    </div>
  );
}
