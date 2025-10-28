import DialogTestWrapped from '@/components/DialogTestWrapped';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface DialogTestWrappedWebflowProps {
  title: string;
  description: string;
  buttonText: string;
}

export function DialogTestWrappedWrapper({
  title,
  description,
  buttonText,
}: DialogTestWrappedWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <DialogTestWrapped
        title={title}
        description={description}
        buttonText={buttonText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(DialogTestWrappedWrapper, {
  name: 'Dialog Test - Controlled',
  description:
    'Test dialog component with controlled state (programmatic control)',
  group: 'Tests',
  props: {
    title: props.Text({
      name: 'Dialog Title',
      defaultValue: 'Dialog Test - Wrapped Pattern',
      tooltip: 'Title shown in the dialog header',
    }),
    description: props.Text({
      name: 'Dialog Description',
      defaultValue: 'This dialog uses controlled state for programmatic control.',
      tooltip: 'Description shown in the dialog header',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Open Controlled Dialog',
      tooltip: 'Text shown on the trigger button',
    }),
  },
});
