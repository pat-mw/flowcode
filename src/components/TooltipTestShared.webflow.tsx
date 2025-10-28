import TooltipTestShared from '@/components/TooltipTestShared';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/app/globals.css';

interface TooltipTestSharedWebflowProps {
  buttonText: string;
  tooltipText: string;
}

function TooltipTestSharedWrapper({
  buttonText,
  tooltipText,
}: TooltipTestSharedWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <TooltipTestShared buttonText={buttonText} tooltipText={tooltipText} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(TooltipTestSharedWrapper, {
  name: 'Tooltip Test - Shared Provider',
  description:
    'Test tooltip component using shared TooltipProvider from WebflowProvidersWrapper',
  group: 'Tests',
  props: {
    buttonText: props.Text({
      name: 'Button Text',
      defaultValue: 'Hover for tooltip',
      tooltip: 'Text shown on the trigger button',
    }),
    tooltipText: props.Text({
      name: 'Tooltip Text',
      defaultValue:
        'This tooltip uses the shared provider from WebflowProvidersWrapper',
      tooltip: 'Text shown in the tooltip',
    }),
  },
});
