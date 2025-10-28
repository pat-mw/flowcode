import PopoverTestControlled from '@/components/PopoverTestControlled';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface PopoverTestControlledWebflowProps {
  buttonText: string;
  title: string;
}

export function PopoverTestControlledWrapper({
  buttonText,
  title,
}: PopoverTestControlledWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <PopoverTestControlled buttonText={buttonText} title={title} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PopoverTestControlledWrapper, {
  name: 'Popover Test - Controlled',
  description:
    'Test popover component with controlled state (programmatic control)',
  group: 'Tests',
  props: {
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Open Controlled Popover',
      tooltip: 'Text shown on the trigger button',
    }),
    title: props.Text({
      name: 'Popover Title',
      defaultValue: 'Controlled Popover',
      tooltip: 'Title shown in the popover header',
    }),
  },
});
