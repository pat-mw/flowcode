'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PopoverTestControlledProps {
  buttonText?: string;
  title?: string;
}

/**
 * Popover Test Component - Controlled Pattern
 *
 * This component demonstrates a popover with controlled state management.
 * The popover state can be controlled programmatically using React hooks.
 *
 * Tests: Popover with controlled state in Webflow Shadow DOM
 */
export default function PopoverTestControlled({
  buttonText = 'Open Controlled Popover',
  title = 'Controlled Popover',
}: PopoverTestControlledProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState('100%');
  const [maxWidth, setMaxWidth] = useState('300px');
  const [height, setHeight] = useState('25px');

  const handleApply = () => {
    setOpen(false);
  };

  const handleReset = () => {
    setWidth('100%');
    setMaxWidth('300px');
    setHeight('25px');
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          Popover Test - Controlled Pattern
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This popover uses controlled state for programmatic control. The state
          persists and can be managed externally.
        </p>
      </div>

      <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">{buttonText}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">{title}</h4>
                <p className="text-sm text-muted-foreground">
                  Configure dimensions with controlled state.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width-controlled">Width</Label>
                  <Input
                    id="width-controlled"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth-controlled">Max. width</Label>
                  <Input
                    id="maxWidth-controlled"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height-controlled">Height</Label>
                  <Input
                    id="height-controlled"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleApply} className="flex-1">
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-mono">Pattern: Controlled</p>
                <p className="text-xs font-mono mt-1">
                  Component: @radix-ui/react-popover
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="text-sm text-muted-foreground space-y-1 text-center">
          <div>Width: {width}</div>
          <div>Max Width: {maxWidth}</div>
          <div>Height: {height}</div>
        </div>
      </div>
    </div>
  );
}
