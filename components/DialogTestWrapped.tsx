'use client';

import { useState } from 'react';
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

export interface DialogTestWrappedProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

/**
 * Dialog Test Component - Wrapped Pattern
 *
 * This component demonstrates a dialog with additional state management
 * and controlled open/close behavior. This pattern is useful when you
 * need to programmatically control the dialog state.
 *
 * Tests: Dialog with controlled state in Webflow Shadow DOM
 */
export default function DialogTestWrapped({
  title = 'Dialog Test - Wrapped Pattern',
  description = 'This dialog uses controlled state for programmatic control.',
  buttonText = 'Open Controlled Dialog',
}: DialogTestWrappedProps) {
  const [open, setOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleConfirm = () => {
    setClickCount((prev) => prev + 1);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="space-y-4">
        <Dialog open={open} onOpenChange={setOpen}>
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
                This dialog demonstrates controlled state management. The dialog
                state can be controlled programmatically using React hooks.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-xs font-mono">
                  Pattern: Controlled (with useState)
                </p>
                <p className="text-xs font-mono mt-1">
                  Component: @radix-ui/react-dialog
                </p>
                <p className="text-xs font-mono mt-1">
                  Confirmed: {clickCount} times
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {clickCount > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Dialog confirmed {clickCount} time{clickCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
