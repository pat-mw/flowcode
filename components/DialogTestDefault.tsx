'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface DialogTestDefaultProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

/**
 * Dialog Test Component - Default Pattern
 *
 * This component uses the standard shadcn Dialog component without any
 * additional provider wrappers. Dialog is self-contained and doesn't
 * require a provider context.
 *
 * Tests: Dialog functionality in Webflow Shadow DOM
 */
export default function DialogTestDefault({
  title = 'Dialog Test - Default Pattern',
  description = 'This dialog uses the default shadcn pattern with no additional providers.',
  buttonText = 'Open Dialog',
}: DialogTestDefaultProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{buttonText}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This is a test dialog to verify that dialogs work correctly in
              Webflow Code Components using the Shadow DOM.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-xs font-mono">
                Pattern: Self-contained (no provider needed)
              </p>
              <p className="text-xs font-mono mt-1">
                Component: @radix-ui/react-dialog
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary">Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
