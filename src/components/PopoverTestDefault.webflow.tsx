import PopoverTestDefault from '@/components/PopoverTestDefault';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

interface PopoverTestDefaultWebflowProps {
  buttonText: string;
  title: string;
}

function PopoverTestDefaultWrapper({
  buttonText,
  title,
}: PopoverTestDefaultWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <PopoverTestDefault buttonText={buttonText} title={title} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PopoverTestDefaultWrapper, {
  name: 'Popover Test - Default',
  description: 'Test popover component with default pattern (self-contained)',
  group: 'Tests',
  props: {
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Open Popover',
      tooltip: 'Text shown on the trigger button',
    }),
    title: props.Text({
      name: 'Popover Title',
      defaultValue: 'Popover Settings',
      tooltip: 'Title shown in the popover header',
    }),
  },
});
