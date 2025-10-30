'use client';

import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';
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
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

interface PieChartDemoProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  showLegend?: boolean;
  showLabels?: boolean;
}

// Demo data for content engagement distribution
const chartData = [
  { name: 'Views', value: 4200, fill: '#2563eb' },
  { name: 'Likes', value: 1800, fill: '#16a34a' },
  { name: 'Comments', value: 950, fill: '#9333ea' },
  { name: 'Shares', value: 650, fill: '#ea580c' },
  { name: 'Saves', value: 420, fill: '#0891b2' },
];

const chartConfig = {
  views: {
    label: 'Views',
    theme: {
      light: '#2563eb',
      dark: '#60a5fa',
    },
  },
  likes: {
    label: 'Likes',
    theme: {
      light: '#16a34a',
      dark: '#4ade80',
    },
  },
  comments: {
    label: 'Comments',
    theme: {
      light: '#9333ea',
      dark: '#a855f7',
    },
  },
  shares: {
    label: 'Shares',
    theme: {
      light: '#ea580c',
      dark: '#fb923c',
    },
  },
  saves: {
    label: 'Saves',
    theme: {
      light: '#0891b2',
      dark: '#22d3ee',
    },
  },
};

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieChartDemo({
  title = 'Content Engagement Distribution',
  description = 'Breakdown of user interactions across your blog',
  ctaText = 'View Details',
  ctaUrl = '#',
  showLegend = true,
  showLabels = true,
}: PieChartDemoProps) {
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {data.name}
                          </span>
                          <span className="text-sm font-bold">
                            {data.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showLabels ? renderCustomizedLabel : false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        {payload.map((entry, index) => (
                          <div
                            key={`legend-${index}`}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
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
