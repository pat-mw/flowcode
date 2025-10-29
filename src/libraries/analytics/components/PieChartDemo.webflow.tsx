import PieChartDemo from '@/components/PieChartDemo';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface PieChartDemoWebflowProps {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  showLegend: boolean;
  showLabels: boolean;
}

export function PieChartDemoWrapper({
  title,
  description,
  ctaText,
  ctaUrl,
  showLegend,
  showLabels,
}: PieChartDemoWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <PieChartDemo
        title={title}
        description={description}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        showLegend={showLegend}
        showLabels={showLabels}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(PieChartDemoWrapper, {
  name: 'Pie Chart Demo',
  description:
    'Display content engagement distribution with a beautiful pie chart showing user interactions',
  group: 'Analytics',
  props: {
    title: props.Text({
      name: 'Chart Title',
      defaultValue: 'Content Engagement Distribution',
      tooltip: 'Main title displayed above the chart',
    }),
    description: props.Text({
      name: 'Chart Description',
      defaultValue: 'Breakdown of user interactions across your blog',
      tooltip: 'Description text displayed below the title',
    }),
    ctaText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'View Details',
      tooltip: 'Text shown on the call-to-action button',
    }),
    ctaUrl: props.Text({
      name: 'CTA URL',
      defaultValue: '#',
      tooltip: 'URL to navigate to when the CTA button is clicked',
    }),
    showLegend: props.Boolean({
      name: 'Show Legend',
      defaultValue: true,
      tooltip: 'Toggle chart legend visibility',
    }),
    showLabels: props.Boolean({
      name: 'Show Labels',
      defaultValue: true,
      tooltip: 'Display percentage labels on chart segments',
    }),
  },
});
