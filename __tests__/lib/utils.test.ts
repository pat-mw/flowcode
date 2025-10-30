import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'truthy', false && 'falsy');
      expect(result).toContain('base');
      expect(result).toContain('truthy');
      expect(result).not.toContain('falsy');
    });

    it('handles undefined and null', () => {
      const result = cn('base', undefined, null);
      expect(result).toContain('base');
    });

    it('merges Tailwind classes correctly', () => {
      // cn should merge conflicting Tailwind classes
      const result = cn('px-4 py-2', 'px-6');
      // Should contain py-2 and the later px-6, not px-4
      expect(result).toContain('py-2');
      expect(result).toContain('px-6');
    });
  });
});
