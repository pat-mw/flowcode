/**
 * Test Page: ComponentGrid URL Patterns
 *
 * This page demonstrates the two URL pattern options for ComponentGrid:
 * 1. Query-based: /path?id=component-id (default)
 * 2. Path-based: /path/component-id (when usePaths=true)
 */

import ComponentGrid from '@/components/registry-dashboard/ComponentGrid';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestComponentGridPathsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            ComponentGrid URL Pattern Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            This page demonstrates how the ComponentGrid component can generate two different
            URL patterns for component detail links.
          </p>
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            URL Pattern Options
          </h2>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <Badge variant="outline" className="mb-2">usePaths = false (default)</Badge>
              <p className="ml-4">
                <strong>Query-based URLs:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">/lander/webcn/component?id=core-login-form</code>
              </p>
              <p className="ml-4 mt-1 text-xs">
                Best for: Single page with dynamic content based on query parameter
              </p>
            </div>
            <div className="pt-2">
              <Badge variant="outline" className="mb-2">usePaths = true</Badge>
              <p className="ml-4">
                <strong>Path-based URLs:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">/lander/webcn/component/core-login-form</code>
              </p>
              <p className="ml-4 mt-1 text-xs">
                Best for: Individual pages for each component (Next.js dynamic routes)
              </p>
            </div>
          </div>
        </Card>

        {/* Query-based Pattern (Default) */}
        <section className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground">
                Query-based URLs
              </h2>
              <Badge variant="outline">usePaths = false</Badge>
            </div>
            <p className="text-muted-foreground">
              Default behavior. Hover over component cards and check the browser status bar to see URLs like: <code>/path?id=component-id</code>
            </p>
          </div>

          <ComponentGrid
            sectionTitle="Components with Query Parameters"
            sectionSubtitle="Click any component to see query-based URL (?id=...)"
            basePath="/lander/webcn/component"
            usePaths={false}
          />
        </section>

        {/* Path-based Pattern */}
        <section className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground">
                Path-based URLs
              </h2>
              <Badge className="bg-green-500">usePaths = true</Badge>
            </div>
            <p className="text-muted-foreground">
              New behavior. Hover over component cards and check the browser status bar to see URLs like: <code>/path/component-id</code>
            </p>
          </div>

          <ComponentGrid
            sectionTitle="Components with Path Parameters"
            sectionSubtitle="Click any component to see path-based URL (/{id})"
            basePath="/lander/webcn/component"
            usePaths={true}
          />
        </section>

        {/* Usage Guide */}
        <Card className="p-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold mb-3 text-purple-900 dark:text-purple-100">
            When to Use Each Pattern
          </h2>
          <div className="space-y-4 text-sm text-purple-800 dark:text-purple-200">
            <div>
              <h3 className="font-semibold mb-1">Query-based (?id=component-id)</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Single component detail page that reads ?id parameter</li>
                <li>Simpler routing setup</li>
                <li>Good for Webflow sites with limited routing control</li>
                <li>Example: <code>/component?id=core-login-form</code></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Path-based (/component-id)</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Individual pages for each component (Next.js dynamic routes)</li>
                <li>Better SEO (cleaner URLs)</li>
                <li>Requires dynamic route setup: <code>/component/[id]/page.tsx</code></li>
                <li>Example: <code>/component/core-login-form</code></li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Implementation Example */}
        <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Implementation Example
          </h2>
          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// Query-based (default)
<ComponentGrid
  basePath="/component"
  usePaths={false}  // or omit (default is false)
/>
// Links to: /component?id=core-login-form

// Path-based
<ComponentGrid
  basePath="/component"
  usePaths={true}
/>
// Links to: /component/core-login-form`}
          </pre>
        </Card>
      </div>
    </div>
  );
}
