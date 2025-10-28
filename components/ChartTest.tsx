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

interface ChartTestProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  showLegend?: boolean;
}

// Fake data for the chart - Monthly blog post engagement metrics
const chartData = [
  { month: 'Jan', views: 2400, likes: 400, comments: 240 },
  { month: 'Feb', views: 1398, likes: 300, comments: 139 },
  { month: 'Mar', views: 9800, likes: 800, comments: 500 },
  { month: 'Apr', views: 3908, likes: 470, comments: 300 },
  { month: 'May', views: 4800, likes: 600, comments: 400 },
  { month: 'Jun', views: 3800, likes: 500, comments: 350 },
  { month: 'Jul', views: 4300, likes: 550, comments: 380 },
  { month: 'Aug', views: 5200, likes: 650, comments: 420 },
  { month: 'Sep', views: 6100, likes: 720, comments: 490 },
  { month: 'Oct', views: 7200, likes: 800, comments: 540 },
  { month: 'Nov', views: 8100, likes: 920, comments: 610 },
  { month: 'Dec', views: 9500, likes: 1100, comments: 750 },
];

const chartConfig = {
  views: {
    label: 'Views',
    theme: {
      light: '#b91c1c',
      dark: '#f87171',
    },
  },
  likes: {
    label: 'Likes',
    theme: {
      light: '#9b2c2c',
      dark: '#ef4444',
    },
  },
  comments: {
    label: 'Comments',
    theme: {
      light: '#7f1d1d',
      dark: '#dc2626',
    },
  },
};

export default function ChartTest({
  title = 'Blog Engagement Analytics',
  description = 'Monthly views, likes, and comments for your blog posts',
  ctaText = 'View Full Report',
  ctaUrl = '#',
  showLegend = true,
}: ChartTestProps) {
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
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            <Bar dataKey="views" fill="var(--color-views)" radius={4} />
            <Bar dataKey="likes" fill="var(--color-likes)" radius={4} />
            <Bar dataKey="comments" fill="var(--color-comments)" radius={4} />
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
