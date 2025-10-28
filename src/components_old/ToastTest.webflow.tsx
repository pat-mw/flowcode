import ToastTest from '@/components/ToastTest';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface ToastTestWebflowProps {
  buttonText: string;
  toastMessage: string;
}

export function ToastTestWrapper({
  buttonText,
  toastMessage,
}: ToastTestWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <ToastTest buttonText={buttonText} toastMessage={toastMessage} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ToastTestWrapper, {
  name: 'Toast Test',
  description:
    'Test toast notifications with various types (success, error, info, warning, promise, actions)',
  group: 'Tests',
  props: {
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Show Toast',
      tooltip: 'Text shown on the default toast button',
    }),
    toastMessage: props.Text({
      name: 'Toast Message',
      defaultValue: 'This is a toast notification',
      tooltip: 'Message shown in the default toast',
    }),
  },
});
