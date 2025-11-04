/**
 * ComponentDetailSidebar Webflow Component Wrapper
 * Sidebar showing component metadata, dependencies, and library info
 */

'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentDetailSidebar, { type ComponentDetailSidebarProps } from '@/components/registry-dashboard/ComponentDetailSidebar';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import type { WebflowCMSComponent } from '@/lib/webflow-cms-types';

interface WrapperProps extends ComponentDetailSidebarProps {
  // CMS fields from Webflow CMS Components Collection
  cmsCategory?: string;
  cmsDependencies?: string; // Comma-separated npm packages
  cmsBackendDependencies?: string; // Comma-separated backend endpoints
  cmsFilePath?: string;
}

export function ComponentDetailSidebarWrapper({
  componentId,
  cmsCategory,
  cmsDependencies,
  cmsBackendDependencies,
  cmsFilePath,
}: WrapperProps) {
  // Build CMS data object from individual props
  const cmsData: WebflowCMSComponent | undefined = (cmsCategory || cmsDependencies || cmsBackendDependencies || cmsFilePath)
    ? {
        category: cmsCategory,
        dependencies: cmsDependencies,
        backendDependencies: cmsBackendDependencies,
        filePath: cmsFilePath,
      }
    : undefined;

  return (
    <WebflowProvidersWrapper>
      <ComponentDetailSidebar componentId={componentId} cmsData={cmsData} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentDetailSidebarWrapper, {
  name: 'Component Detail Sidebar',
  description: 'Sidebar showing component metadata, category, library info, dependencies, and file path. Supports CMS data injection.',
  group: 'Registry Dashboard',
  props: {
    componentId: props.Text({
      name: 'Component ID',
      defaultValue: '',
      tooltip: 'Component ID to show metadata for (e.g., "core-login-form"). If empty, reads from URL query parameter ?id=',
    }),
    cmsCategory: props.Text({
      name: 'CMS: Category',
      defaultValue: '',
      tooltip: 'Optional: Component category from Webflow CMS. Bind to CMS field "category".',
    }),
    cmsDependencies: props.Text({
      name: 'CMS: Dependencies',
      defaultValue: '',
      tooltip: 'Optional: Comma-separated npm dependencies from Webflow CMS. Bind to CMS field "dependencies".',
    }),
    cmsBackendDependencies: props.Text({
      name: 'CMS: Backend Dependencies',
      defaultValue: '',
      tooltip: 'Optional: Comma-separated backend endpoints from Webflow CMS. Bind to CMS field "backend-dependencies".',
    }),
    cmsFilePath: props.Text({
      name: 'CMS: File Path',
      defaultValue: '',
      tooltip: 'Optional: File path from Webflow CMS. Bind to CMS field "file-path".',
    }),
  },
});
