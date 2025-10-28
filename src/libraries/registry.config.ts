import { defineLibraries } from "./types";
import { coreLibrary } from "./core";
import { analyticsLibrary } from "./analytics";
import { interactiveLibrary } from "./interactive";

export const libraries = defineLibraries({
  core: coreLibrary,
  analytics: analyticsLibrary,
  interactive: interactiveLibrary,
});

// Export type for use in scripts
export type LibraryRegistry = typeof libraries;
export type LibraryKey = keyof LibraryRegistry;
