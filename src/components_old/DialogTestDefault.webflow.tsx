import DialogTestDefault from '@/components/DialogTestDefault';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface DialogTestDefaultWebflowProps {
  title: string;
  description: string;
  buttonText: string;
}

export function DialogTestDefaultWrapper({
  title,
  description,
  buttonText,
}: DialogTestDefaultWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <DialogTestDefault
        title={title}
        description={description}
        buttonText={buttonText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(DialogTestDefaultWrapper, {
  name: 'Dialog Test - Default',
  description: 'Test dialog component with default pattern (self-contained)',
  group: 'Tests',
  props: {
    title: props.Text({
      name: 'Dialog Title',
      defaultValue: 'Dialog Test - Default Pattern',
      tooltip: 'Title shown in the dialog header',
    }),
    description: props.Text({
      name: 'Dialog Description',
      defaultValue:
        'This dialog uses the default shadcn pattern with no additional providers.',
      tooltip: 'Description shown in the dialog header',
    }),
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Open Dialog',
      tooltip: 'Text shown on the trigger button',
    }),
  },
});
