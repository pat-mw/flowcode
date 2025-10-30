import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { act } from 'react';

// Polyfill React.act for React 19 compatibility with Testing Library
// Testing Library expects React.act but React 19 moved it
if (typeof globalThis.IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

// Export act from React for Testing Library to use
globalThis.React = { ...globalThis.React, act };

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (required for many UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (required for lazy loading, viewport detection)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (required for responsive components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock window.scrollTo (prevents errors in components that use scrolling)
window.scrollTo = vi.fn();

// Mock window.location for navigation tests
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
} as any;
