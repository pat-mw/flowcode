/**
 * Test Page: CMS Data Injection for Registry Dashboard Components
 *
 * This page demonstrates how registry-dashboard components can accept
 * data from Webflow CMS while maintaining fallback to registry data.
 */

import ComponentDetailHeader from '@/components/registry-dashboard/ComponentDetailHeader';
import ComponentDetailSidebar from '@/components/registry-dashboard/ComponentDetailSidebar';
import ComponentDetailProps from '@/components/registry-dashboard/ComponentDetailProps';
import ComponentDetailUsage from '@/components/registry-dashboard/ComponentDetailUsage';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestCMSInjectionPage() {
  // Mock CMS data simulating what would come from Webflow CMS
  const mockCMSComponentData = {
    name: 'Enhanced Login Form',
    componentId: 'core-login-form',
    description: 'This description comes from Webflow CMS instead of the registry. It demonstrates how CMS data can override registry defaults.',
    category: 'CMS Category',
    tags: 'cms-tag1, cms-tag2, cms-injected',
    dependencies: 'react-hook-form, zod, @hookform/resolvers',
    backendDependencies: '/api/auth/login, /api/auth/session',
    filePath: 'src/components/enhanced/LoginForm.tsx',
    usageExample: `import { LoginForm } from '@/components/core/LoginForm';

// This usage example comes from CMS
export default function Page() {
  return <LoginForm onSuccess={() => router.push('/dashboard')} />;
}`,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            CMS Data Injection Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            This page demonstrates how registry-dashboard components support data injection
            from Webflow CMS. Each component shows both registry-only and CMS-injected versions.
          </p>
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            How CMS Injection Works
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>In Webflow Designer:</strong> Designers can bind individual CMS fields to component props.
              For example, bind the &quot;Name&quot; field from the Components collection to the &quot;CMS: Name&quot; prop.
            </p>
            <p>
              <strong>Fallback Behavior:</strong> If CMS props are empty, components automatically fall back to registry data.
              This ensures backward compatibility and allows partial CMS overrides.
            </p>
            <p>
              <strong>Supported Components:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><Badge variant="secondary">ComponentDetailHeader</Badge> - name, componentId, description, category, tags</li>
              <li><Badge variant="secondary">ComponentDetailSidebar</Badge> - category, dependencies, backendDependencies, filePath</li>
              <li><Badge variant="secondary">ComponentDetailUsage</Badge> - usageExample</li>
              <li><Badge variant="secondary">ComponentDetailProps</Badge> - Registry only (props array too complex)</li>
              <li><Badge variant="secondary">ComponentGrid</Badge> - Registry only (displays all items)</li>
            </ul>
          </div>
        </Card>

        {/* Test: ComponentDetailHeader */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground border-b pb-2">
            ComponentDetailHeader
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registry Only */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Registry Only</Badge>
                <span className="text-sm text-muted-foreground">No CMS data injected</span>
              </div>
              <ComponentDetailHeader
                componentId="core-login-form"
                backToLibraryUrl="/test-cms-injection"
              />
            </Card>

            {/* CMS Injected */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">CMS Injected</Badge>
                <span className="text-sm text-muted-foreground">Using mock CMS data + custom back URL</span>
              </div>
              <ComponentDetailHeader
                componentId="core-login-form"
                cmsData={mockCMSComponentData}
                backToLibraryUrl="/test-cms-injection"
              />
            </Card>
          </div>
        </section>

        {/* Test: ComponentDetailSidebar */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground border-b pb-2">
            ComponentDetailSidebar
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registry Only */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Registry Only</Badge>
                <span className="text-sm text-muted-foreground">No CMS data injected</span>
              </div>
              <ComponentDetailSidebar componentId="core-login-form" />
            </Card>

            {/* CMS Injected */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">CMS Injected</Badge>
                <span className="text-sm text-muted-foreground">Using mock CMS data</span>
              </div>
              <ComponentDetailSidebar
                componentId="core-login-form"
                cmsData={mockCMSComponentData}
              />
            </Card>
          </div>
        </section>

        {/* Test: ComponentDetailUsage */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground border-b pb-2">
            ComponentDetailUsage
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registry Only */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Registry Only</Badge>
                <span className="text-sm text-muted-foreground">No CMS data injected</span>
              </div>
              <ComponentDetailUsage componentId="core-login-form" />
            </Card>

            {/* CMS Injected */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">CMS Injected</Badge>
                <span className="text-sm text-muted-foreground">Using mock CMS data</span>
              </div>
              <ComponentDetailUsage
                componentId="core-login-form"
                cmsData={mockCMSComponentData}
              />
            </Card>
          </div>
        </section>

        {/* Test: ComponentDetailProps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground border-b pb-2">
            ComponentDetailProps
          </h2>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Registry Only</Badge>
              <span className="text-sm text-muted-foreground">
                CMS injection not supported (props array too complex)
              </span>
            </div>
            <ComponentDetailProps componentId="core-login-form" />
          </Card>
        </section>

        {/* Webflow Usage Instructions */}
        <Card className="p-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold mb-3 text-purple-900 dark:text-purple-100">
            Using in Webflow Designer
          </h2>
          <div className="space-y-3 text-sm text-purple-800 dark:text-purple-200">
            <p>
              To use these components with CMS data in Webflow:
            </p>
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                <strong>Add component to page:</strong> Drag the component from the Components panel
              </li>
              <li>
                <strong>Configure navigation:</strong> Set &quot;Back to Library URL&quot; to your component library page (e.g., &quot;/components&quot;)
              </li>
              <li>
                <strong>Bind to CMS Collection:</strong> Select the component and choose &quot;Get data from...&quot; → Components collection
              </li>
              <li>
                <strong>Map CMS fields to props:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>CMS: Name → Bind to &quot;name&quot; field</li>
                  <li>CMS: Component ID → Bind to &quot;component-id&quot; field</li>
                  <li>CMS: Description → Bind to &quot;description&quot; field</li>
                  <li>CMS: Category → Bind to &quot;category&quot; field</li>
                  <li>CMS: Tags → Bind to &quot;tags&quot; field</li>
                  <li>And so on...</li>
                </ul>
              </li>
              <li>
                <strong>Optional props:</strong> Leave props empty to use registry fallback data
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
