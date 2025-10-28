import ChartTest from '@/components/ChartTest';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export interface ChartTestWebflowProps {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  showLegend: boolean;
}

export function ChartTestWrapper({
  title,
  description,
  ctaText,
  ctaUrl,
  showLegend,
}: ChartTestWebflowProps) {
  return (
    <WebflowProvidersWrapper>
      <ChartTest
        title={title}
        description={description}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        showLegend={showLegend}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ChartTestWrapper, {
  name: 'Chart Analytics',
  description:
    'Display blog engagement analytics with a beautiful bar chart showing views, likes, and comments over time',
  group: 'Tests',
  props: {
    title: props.Text({
      name: 'Chart Title',
      defaultValue: 'Blog Engagement Analytics',
      tooltip: 'Main title displayed above the chart',
    }),
    description: props.Text({
      name: 'Chart Description',
      defaultValue: 'Monthly views, likes, and comments for your blog posts',
      tooltip: 'Description text displayed below the title',
    }),
    ctaText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'View Full Report',
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
  },
});
