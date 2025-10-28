'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PopoverTestDefaultProps {
  buttonText?: string;
  title?: string;
}

/**
 * Popover Test Component - Default Pattern
 *
 * This component uses the standard shadcn Popover component without any
 * additional provider wrappers. Popover is self-contained and doesn't
 * require a provider context.
 *
 * Tests: Popover functionality in Webflow Shadow DOM
 */
export default function PopoverTestDefault({
  buttonText = 'Open Popover',
  title = 'Popover Settings',
}: PopoverTestDefaultProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Popover Test - Default Pattern</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This popover uses the default shadcn pattern with no additional
          providers. It is self-contained and works independently.
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{buttonText}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{title}</h4>
              <p className="text-sm text-muted-foreground">
                Test form inside a popover component.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  defaultValue="100%"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Max. width</Label>
                <Input
                  id="maxWidth"
                  defaultValue="300px"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  defaultValue="25px"
                  className="col-span-2 h-8"
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs font-mono">Pattern: Self-contained</p>
              <p className="text-xs font-mono mt-1">
                Component: @radix-ui/react-popover
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
