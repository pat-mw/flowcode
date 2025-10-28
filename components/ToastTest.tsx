'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ToastTestProps {
  buttonText?: string;
  toastMessage?: string;
}

export default function ToastTest({
  buttonText = 'Show Toast',
  toastMessage = 'This is a toast notification',
}: ToastTestProps) {
  const showDefaultToast = () => {
    toast(toastMessage);
  };

  const showSuccessToast = () => {
    toast.success('Success! Operation completed successfully');
  };

  const showErrorToast = () => {
    toast.error('Error! Something went wrong');
  };

  const showInfoToast = () => {
    toast.info('Info: This is an informational message');
  };

  const showWarningToast = () => {
    toast.warning('Warning: Please review this action');
  };

  const showPromiseToast = () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));

    toast.promise(promise, {
      loading: 'Loading...',
      success: 'Promise resolved!',
      error: 'Promise rejected',
    });
  };

  const showToastWithAction = () => {
    toast('Event has been created', {
      action: {
        label: 'Undo',
        onClick: () => toast.info('Undo clicked'),
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={showDefaultToast} variant="outline">
          {buttonText}
        </Button>
        <Button onClick={showSuccessToast} variant="outline">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} variant="outline">
          Error Toast
        </Button>
        <Button onClick={showInfoToast} variant="outline">
          Info Toast
        </Button>
        <Button onClick={showWarningToast} variant="outline">
          Warning Toast
        </Button>
        <Button onClick={showPromiseToast} variant="outline">
          Promise Toast
        </Button>
        <Button onClick={showToastWithAction} variant="outline" className="col-span-2">
          Toast with Action
        </Button>
      </div>
    </div>
  );
}
