import { defineLibraries } from "./types";
import { coreLibrary } from "./core";
import { analyticsLibrary } from "./analytics";
import { interactiveLibrary } from "./interactive";
import { webcnLibrary } from "./webcn";
import { waitlistLibrary } from "./waitlist/config";
import { registryDashboardLibrary } from "./registryDashboard";
import { blogDemoLibrary } from "./blogDemo";

export const libraries = defineLibraries({
  core: coreLibrary,
  analytics: analyticsLibrary,
  interactive: interactiveLibrary,
  webcn: webcnLibrary,
  waitlist: waitlistLibrary,
  registryDashboard: registryDashboardLibrary,
  blogDemo: blogDemoLibrary,
});

// Export type for use in scripts
export type LibraryRegistry = typeof libraries;
export type LibraryKey = keyof LibraryRegistry;
