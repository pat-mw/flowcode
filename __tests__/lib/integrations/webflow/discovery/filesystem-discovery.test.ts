/**
 * Unit tests for FilesystemDiscovery
 * Tests component scanning, dependency resolution, and file operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilesystemDiscovery } from '@/lib/integrations/webflow/discovery/filesystem';
import { DiscoveryError } from '@/lib/integrations/webflow/discovery/types';
import path from 'path';

// Mock glob for filesystem scanning
vi.mock('glob', () => ({
  glob: vi.fn(),
}));

// Mock fs/promises for file operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
}));

describe('FilesystemDiscovery', () => {
  let discovery: FilesystemDiscovery;

  beforeEach(async () => {
    vi.clearAllMocks();
    discovery = new FilesystemDiscovery();
  });

  describe('listComponents', () => {
    it('should find all .webflow.tsx files in src/ directory', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue([
        'src/components/Button.webflow.tsx',
        'src/components/Form.webflow.tsx',
      ] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import { declareComponent } from '@webflow/react';
        export default declareComponent(Button, {
          name: 'Button',
          description: 'A simple button',
        });
      `);

      const components = await discovery.listComponents();

      expect(components.length).toBe(2);
      expect(glob).toHaveBeenCalledWith(expect.stringContaining('*.webflow.tsx'));
    });

    it('should extract component metadata from declareComponent', async () => {
      const { glob } = await import('glob');
      const { readFile, stat } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/TestButton.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import { Button } from '@/components/ui/button';
        import { declareComponent } from '@webflow/react';
        import { props } from '@webflow/data-types';

        export default declareComponent(Button, {
          name: 'Test Button',
          description: 'A test button component',
          group: 'Form',
        });
      `);

      vi.mocked(stat).mockResolvedValue({
        size: 1024,
        mtime: new Date('2025-01-01'),
      } as any);

      const components = await discovery.listComponents();

      expect(components[0]).toMatchObject({
        name: 'Test Button',
        description: 'A test button component',
        group: 'Form',
        fileSize: 1024,
      });
    });

    it('should parse dependencies from imports', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/Form.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import React from 'react';
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        import { cn } from '@/lib/utils';
        import { declareComponent } from '@webflow/react';

        export default declareComponent(Form, { name: 'Form' });
      `);

      const components = await discovery.listComponents();

      expect(components[0].dependencies).toEqual(
        expect.arrayContaining([
          'react',
          '@/components/ui/button',
          '@/components/ui/input',
          '@/lib/utils',
        ])
      );
    });

    it('should return empty array if no components found', async () => {
      const { glob } = await import('glob');
      vi.mocked(glob).mockResolvedValue([] as any);

      const components = await discovery.listComponents();

      expect(components).toEqual([]);
    });

    it('should handle filesystem read errors gracefully', async () => {
      const { glob } = await import('glob');
      vi.mocked(glob).mockRejectedValue(new Error('Permission denied'));

      await expect(discovery.listComponents()).rejects.toThrow(DiscoveryError);
    });
  });

  describe('getComponentDetails', () => {
    it('should return full component metadata by ID', async () => {
      const { glob } = await import('glob');
      const { readFile, stat } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/TestButton.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        export default declareComponent(Button, {
          name: 'Test Button',
          description: 'A test button'
        });
      `);

      vi.mocked(stat).mockResolvedValue({
        size: 2048,
        mtime: new Date('2025-01-01'),
      } as any);

      const component = await discovery.getComponentDetails('test-button');

      expect(component).not.toBeNull();
      expect(component?.name).toBe('Test Button');
      expect(component?.fileSize).toBe(2048);
    });

    it('should return null if component ID not found', async () => {
      const { glob } = await import('glob');
      vi.mocked(glob).mockResolvedValue([] as any);

      const component = await discovery.getComponentDetails('nonexistent');

      expect(component).toBeNull();
    });
  });

  describe('getComponentFiles', () => {
    it('should return component files and dependencies', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue([
        'src/components/Button.webflow.tsx',
      ] as any);

      vi.mocked(readFile).mockImplementation((filePath) => {
        if (filePath.toString().includes('Button.webflow.tsx')) {
          return Promise.resolve(`
            import { Button } from '@/components/ui/button';
            export default declareComponent(Button, { name: 'Button' });
          `);
        }
        if (filePath.toString().includes('button.tsx')) {
          return Promise.resolve('export const Button = () => <button />;');
        }
        return Promise.resolve('');
      });

      const files = await discovery.getComponentFiles(['button']);

      expect(files.components.length).toBeGreaterThan(0);
      expect(files.components[0].path).toContain('Button.webflow.tsx');
    });

    it('should handle missing dependency files gracefully', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/Test.webflow.tsx'] as any);

      vi.mocked(readFile).mockImplementation((filePath) => {
        if (filePath.toString().includes('Test.webflow.tsx')) {
          return Promise.resolve(`
            import { Missing } from '@/components/missing';
            export default declareComponent(Test, { name: 'Test' });
          `);
        }
        return Promise.reject(new Error('File not found'));
      });

      const files = await discovery.getComponentFiles(['test']);

      // Should still return the main component even if dep is missing
      expect(files.components.length).toBeGreaterThan(0);
    });
  });

  describe('getDependencies', () => {
    it('should resolve component dependencies', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/Form.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        export default declareComponent(Form, { name: 'Form' });
      `);

      const deps = await discovery.getDependencies('form');

      expect(deps).toContain('@/components/ui/button');
      expect(deps).toContain('@/components/ui/input');
    });

    it('should exclude Node.js built-in modules', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/Test.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import path from 'path';
        import fs from 'fs';
        import { Button } from '@/components/ui/button';
        export default declareComponent(Test, { name: 'Test' });
      `);

      const deps = await discovery.getDependencies('test');

      expect(deps).not.toContain('path');
      expect(deps).not.toContain('fs');
      expect(deps).toContain('@/components/ui/button');
    });

    it('should exclude Next.js specific imports', async () => {
      const { glob } = await import('glob');
      const { readFile } = await import('fs/promises');

      vi.mocked(glob).mockResolvedValue(['src/components/Test.webflow.tsx'] as any);

      vi.mocked(readFile).mockResolvedValue(`
        import Link from 'next/link';
        import { useRouter } from 'next/navigation';
        import { Button } from '@/components/ui/button';
        export default declareComponent(Test, { name: 'Test' });
      `);

      const deps = await discovery.getDependencies('test');

      expect(deps).not.toContain('next/link');
      expect(deps).not.toContain('next/navigation');
      expect(deps).toContain('@/components/ui/button');
    });
  });

  describe('provider identification', () => {
    it('should have name property set to "filesystem"', () => {
      expect(discovery.name).toBe('filesystem');
    });
  });
});
