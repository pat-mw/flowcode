'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

interface BarChartDemoProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  showLegend?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

// Demo data for blog categories and their post counts
const chartData = [
  { category: 'Technology', posts: 45, published: 42 },
  { category: 'Design', posts: 38, published: 35 },
  { category: 'Business', posts: 32, published: 30 },
  { category: 'Marketing', posts: 28, published: 26 },
  { category: 'Development', posts: 52, published: 48 },
  { category: 'Lifestyle', posts: 22, published: 20 },
];

const chartConfig = {
  posts: {
    label: 'Total Posts',
    theme: {
      light: '#2563eb',
      dark: '#60a5fa',
    },
  },
  published: {
    label: 'Published',
    theme: {
      light: '#16a34a',
      dark: '#4ade80',
    },
  },
};

export default function BarChartDemo({
  title = 'Blog Categories Performance',
  description = 'Total posts and published content by category',
  ctaText = 'Manage Categories',
  ctaUrl = '#',
  showLegend = true,
  orientation = 'vertical',
}: BarChartDemoProps) {
  const handleCtaClick = () => {
    if (ctaUrl && ctaUrl !== '#') {
      window.location.href = ctaUrl;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} />
              </>
            )}
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            <Bar
              dataKey="posts"
              fill="var(--color-posts)"
              radius={4}
              {...(orientation === 'horizontal' && { layout: 'horizontal' })}
            />
            <Bar
              dataKey="published"
              fill="var(--color-published)"
              radius={4}
              {...(orientation === 'horizontal' && { layout: 'horizontal' })}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {ctaText && (
        <CardFooter>
          <Button onClick={handleCtaClick} className="w-full">
            {ctaText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
