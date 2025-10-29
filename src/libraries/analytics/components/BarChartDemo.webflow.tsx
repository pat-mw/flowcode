import BarChartDemo from '@/components/BarChartDemo';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface BarChartDemoWebflowProps {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  showLegend: boolean;
  orientation: 'vertical' | 'horizontal';
}

export function BarChartDemoWrapper({
  title,
  description,
  ctaText,
  ctaUrl,
  showLegend,
  orientation,
}: BarChartDemoWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <BarChartDemo
        title={title}
        description={description}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        showLegend={showLegend}
        orientation={orientation}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(BarChartDemoWrapper, {
  name: 'Bar Chart Demo',
  description:
    'Display blog category performance with a configurable bar chart showing total and published posts',
  group: 'Analytics',
  props: {
    title: props.Text({
      name: 'Chart Title',
      defaultValue: 'Blog Categories Performance',
      tooltip: 'Main title displayed above the chart',
    }),
    description: props.Text({
      name: 'Chart Description',
      defaultValue: 'Total posts and published content by category',
      tooltip: 'Description text displayed below the title',
    }),
    ctaText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'Manage Categories',
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
    orientation: props.Variant({
      name: 'Chart Orientation',
      options: ['vertical', 'horizontal'],
      defaultValue: 'vertical',
      tooltip: 'Display bars vertically or horizontally',
    }),
  },
});
