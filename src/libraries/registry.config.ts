import { defineLibraries } from "./types";
import { coreLibrary } from "./core";
import { analyticsLibrary } from "./analytics";
import { interactiveLibrary } from "./interactive";
import { webcnLibrary } from "./webcn";
import { waitlistLibrary } from "./waitlist";

export const libraries = defineLibraries({
  core: coreLibrary,
  analytics: analyticsLibrary,
  interactive: interactiveLibrary,
  webcn: webcnLibrary,
  waitlist: waitlistLibrary,
});

// Export type for use in scripts
export type LibraryRegistry = typeof libraries;
export type LibraryKey = keyof LibraryRegistry;
