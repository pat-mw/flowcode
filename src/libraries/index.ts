import {
  libraries,
  type LibraryRegistry,
  type LibraryKey,
} from "./registry.config";

export { libraries };
export type { LibraryRegistry, LibraryKey };

/**
 * Get library configuration by key
 */
export function getLibrary(key: LibraryKey) {
  return libraries[key];
}

/**
 * Get all library keys
 */
export function getLibraryKeys(): LibraryKey[] {
  return Object.keys(libraries) as LibraryKey[];
}

/**
 * Get all enabled libraries for deployment
 */
export function getDeployableLibraries() {
  return getLibraryKeys().filter(
    (key) => libraries[key].deploy?.enabled !== false
  );
}

/**
 * Generate webflow.json manifest for a library
 */
export function generateManifest(key: LibraryKey) {
  const lib = libraries[key];

  return {
    library: {
      name: lib.id,
      components: Array.isArray(lib.components)
        ? lib.components
        : [lib.components],
      bundleConfig: lib.bundleConfig || "./webpack.webflow.js",
      description: lib.description,
      id: lib.id,
    },
    telemetry: {
      global: {
        allowTelemetry: true,
      },
    },
  };
}
