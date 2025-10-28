'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

// Direct implementation imports
import DialogTestDefault from '@/components/DialogTestDefault';
import DialogTestWrapped from '@/components/DialogTestWrapped';
import TooltipTestShared from '@/components/TooltipTestShared';
import TooltipTestSelfContained from '@/components/TooltipTestSelfContained';
import PopoverTestDefault from '@/components/PopoverTestDefault';
import PopoverTestControlled from '@/components/PopoverTestControlled';
import ToastTest from '@/components/ToastTest';
import ChartTest from '@/components/ChartTest';

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Webflow Component Test Suite
        </h1>
        <p className="text-muted-foreground">
          Test shadcn components with different provider patterns for Webflow
          Code Components. All components are wrapped with WebflowProvidersWrapper
          to simulate Webflow Shadow DOM environment.
        </p>
      </div>

      <Tabs defaultValue="dialog" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dialog">Dialogs</TabsTrigger>
          <TabsTrigger value="tooltip">Tooltips</TabsTrigger>
          <TabsTrigger value="popover">Popovers</TabsTrigger>
          <TabsTrigger value="toast">Toasts</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {/* Dialog Tests */}
        <TabsContent value="dialog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dialog Components</CardTitle>
              <CardDescription>
                Testing dialog components with different patterns. Dialogs are
                self-contained and do not require a provider. All wrapped with
                WebflowProvidersWrapper.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Default Pattern</CardTitle>
                    <CardDescription>
                      Standard uncontrolled dialog
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <DialogTestDefault
                        title="Dialog Test - Default"
                        description="This dialog uses the default pattern with WebflowProvidersWrapper"
                        buttonText="Open Dialog"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Controlled Pattern
                    </CardTitle>
                    <CardDescription>
                      Dialog with controlled state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <DialogTestWrapped
                        title="Dialog Test - Controlled"
                        description="This controlled dialog uses WebflowProvidersWrapper"
                        buttonText="Open Controlled Dialog"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tooltip Tests */}
        <TabsContent value="tooltip" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tooltip Components</CardTitle>
              <CardDescription>
                Testing tooltip components with shared vs self-contained
                providers. All wrapped with WebflowProvidersWrapper.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Shared Provider Pattern
                    </CardTitle>
                    <CardDescription>
                      Uses TooltipProvider from WebflowProvidersWrapper
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <TooltipTestShared
                        buttonText="Hover for Tooltip"
                        tooltipText="This tooltip uses the shared TooltipProvider from WebflowProvidersWrapper"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Self-Contained Provider Pattern
                    </CardTitle>
                    <CardDescription>
                      Includes its own TooltipProvider
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <TooltipTestSelfContained
                        buttonText="Hover for Tooltip"
                        tooltipText="This tooltip uses its own self-contained TooltipProvider"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-semibold mb-2">Provider Comparison:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Shared Provider:</strong> Uses the TooltipProvider
                    from WebflowProvidersWrapper. More efficient when you have
                    multiple tooltip components on the same page.
                  </li>
                  <li>
                    <strong>Self-Contained Provider:</strong> Each component
                    wraps itself with its own TooltipProvider. Better for
                    isolated components.
                  </li>
                  <li>
                    Both patterns work correctly in Webflow Shadow DOM
                    environment.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popover Tests */}
        <TabsContent value="popover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popover Components</CardTitle>
              <CardDescription>
                Testing popover components with default vs controlled patterns.
                Popovers are self-contained like dialogs. All wrapped with
                WebflowProvidersWrapper.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Default Pattern</CardTitle>
                    <CardDescription>
                      Standard uncontrolled popover
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <PopoverTestDefault
                        buttonText="Open Popover"
                        title="Popover Settings"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Controlled Pattern
                    </CardTitle>
                    <CardDescription>
                      Popover with controlled state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebflowProvidersWrapper>
                      <PopoverTestControlled
                        buttonText="Open Controlled Popover"
                        title="Controlled Popover"
                      />
                    </WebflowProvidersWrapper>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toast Tests */}
        <TabsContent value="toast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toast Components</CardTitle>
              <CardDescription>
                Testing toast notifications using sonner. The Toaster component
                is included in WebflowProvidersWrapper and works across Shadow
                DOM boundaries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Toast Notifications</CardTitle>
                  <CardDescription>
                    Test various toast types: default, success, error, info,
                    warning, promise, and action toasts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebflowProvidersWrapper>
                    <ToastTest
                      buttonText="Show Toast"
                      toastMessage="This is a toast notification from the test page"
                    />
                  </WebflowProvidersWrapper>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-semibold mb-2">Toast Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Sonner Integration:</strong> Uses the sonner toast
                    library with Toaster component in WebflowProvidersWrapper
                  </li>
                  <li>
                    <strong>Shadow DOM Compatible:</strong> Toast notifications
                    work correctly across Webflow Shadow DOM boundaries
                  </li>
                  <li>
                    <strong>Multiple Types:</strong> Supports default, success,
                    error, info, warning, promise, and action toasts
                  </li>
                  <li>
                    <strong>Action Support:</strong> Toasts can include action
                    buttons for user interaction
                  </li>
                  <li>
                    <strong>Promise Handling:</strong> Special toast type for
                    handling async operations with loading, success, and error
                    states
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Tests */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Components</CardTitle>
              <CardDescription>
                Testing shadcn chart components with recharts integration.
                Charts display blog engagement analytics with configurable
                properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Analytics Bar Chart
                  </CardTitle>
                  <CardDescription>
                    Multi-series bar chart with views, likes, and comments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebflowProvidersWrapper>
                    <ChartTest
                      title="Blog Engagement Analytics"
                      description="Monthly views, likes, and comments for your blog posts"
                      ctaText="View Full Report"
                      ctaUrl="#"
                      showLegend={true}
                    />
                  </WebflowProvidersWrapper>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-semibold mb-2">Chart Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Recharts Integration:</strong> Uses recharts for
                    powerful data visualization
                  </li>
                  <li>
                    <strong>shadcn/ui Charts:</strong> Built on top of shadcn
                    chart components with consistent styling
                  </li>
                  <li>
                    <strong>Configurable Props:</strong> Title, description,
                    CTA button text and URL, legend visibility
                  </li>
                  <li>
                    <strong>Responsive:</strong> Chart automatically adjusts to
                    container width
                  </li>
                  <li>
                    <strong>Tooltips:</strong> Interactive tooltips show
                    detailed data on hover
                  </li>
                  <li>
                    <strong>Theme Aware:</strong> Uses CSS variables for colors
                    that adapt to light/dark mode
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What to Test:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Verify all dialogs, tooltips, and popovers open and close
                correctly
              </li>
              <li>
                Check that controlled components maintain state properly
              </li>
              <li>
                Test tooltip delay and multiple tooltip interactions
              </li>
              <li>Verify form inputs in popovers work correctly</li>
              <li>Ensure all components render with proper styling</li>
              <li>
                All components are wrapped with WebflowProvidersWrapper to
                simulate Webflow environment
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Provider Patterns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>Dialogs & Popovers:</strong> Self-contained (no provider
                needed)
              </li>
              <li>
                <strong>Tooltips (Shared):</strong> Use TooltipProvider from
                WebflowProvidersWrapper
              </li>
              <li>
                <strong>Tooltips (Self-Contained):</strong> Each component has
                its own provider
              </li>
              <li>
                <strong>WebflowProvidersWrapper:</strong> Provides Dark Mode (via className),
                QueryClientProvider, and TooltipProvider
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">WebflowProvidersWrapper Setup:</h4>
            <div className="p-3 bg-muted rounded-md font-mono text-xs">
              <div>QueryClientProvider (singleton shared cache)</div>
              <div>└─ TooltipProvider (delayDuration: 200ms)</div>
              <div>&nbsp;&nbsp;&nbsp;└─ div.dark.font-inherit (dark mode + font)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ Your Component</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: ThemeProvider removed - it doesn&apos;t work in Shadow DOM.
              Dark mode applied directly via className.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Test all components on this page</li>
              <li>Run `pnpm webflow:bundle` to verify build</li>
              <li>Check bundle size with `pnpm webflow:bundle:size`</li>
              <li>Deploy to Webflow with `pnpm webflow:share`</li>
              <li>Test in Webflow Designer to verify Shadow DOM compatibility</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
