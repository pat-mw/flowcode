import TooltipTestSelfContained from '@/components/TooltipTestSelfContained';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

interface TooltipTestSelfContainedWebflowProps {
  buttonText: string;
  tooltipText: string;
}

function TooltipTestSelfContainedWrapper({
  buttonText,
  tooltipText,
}: TooltipTestSelfContainedWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <TooltipTestSelfContained
        buttonText={buttonText}
        tooltipText={tooltipText}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(TooltipTestSelfContainedWrapper, {
  name: 'Tooltip Test - Self-Contained',
  description:
    'Test tooltip component with its own TooltipProvider (independent)',
  group: 'Tests',
  props: {
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Hover for tooltip',
      tooltip: 'Text shown on the trigger button',
    }),
    tooltipText: props.Text({
      name: 'Tooltip Text',
      defaultValue: 'This tooltip uses its own self-contained provider',
      tooltip: 'Text shown in the tooltip',
    }),
  },
});
