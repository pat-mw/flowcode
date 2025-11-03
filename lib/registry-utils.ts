import { libraries, type LibraryKey } from "@/src/libraries/registry.config";
import type { ComponentMetadata } from "@/src/libraries/types";

/**
 * Extended component metadata with library information
 */
export interface ComponentWithLibrary extends ComponentMetadata {
  libraryKey: LibraryKey;
  libraryName: string;
}

/**
 * Get all components from all libraries with their library context
 */
export function getAllComponents(): ComponentWithLibrary[] {
  const allComponents: ComponentWithLibrary[] = [];

  for (const [key, library] of Object.entries(libraries)) {
    if (library.componentMetadata) {
      library.componentMetadata.forEach((component) => {
        allComponents.push({
          ...component,
          libraryKey: key as LibraryKey,
          libraryName: library.name,
        });
      });
    }
  }

  return allComponents;
}

/**
 * Get a specific component by its unique ID
 */
export function getComponentById(
  id: string
): ComponentWithLibrary | undefined {
  const allComponents = getAllComponents();
  return allComponents.find((c) => c.id === id);
}

/**
 * Get all components from a specific library
 */
export function getComponentsByLibrary(
  libraryKey: LibraryKey
): ComponentMetadata[] {
  const library = libraries[libraryKey];
  return library.componentMetadata || [];
}

/**
 * Get components grouped by library
 */
export function getComponentsByLibraryGrouped(): Array<{
  libraryKey: LibraryKey;
  libraryName: string;
  libraryDescription: string;
  components: ComponentMetadata[];
}> {
  const libraryKeys = Object.keys(libraries) as LibraryKey[];

  return libraryKeys
    .map((key) => ({
      libraryKey: key,
      libraryName: libraries[key].name,
      libraryDescription: libraries[key].description,
      components: libraries[key].componentMetadata || [],
    }))
    .filter((group) => group.components.length > 0); // Only include libraries with components
}

/**
 * Search components by name, description, or tags
 */
export function searchComponents(query: string): ComponentWithLibrary[] {
  const allComponents = getAllComponents();
  const lowerQuery = query.toLowerCase();

  return allComponents.filter(
    (component) =>
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      component.category?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all unique tags across all components
 */
export function getAllTags(): string[] {
  const allComponents = getAllComponents();
  const tagSet = new Set<string>();

  allComponents.forEach((component) => {
    component.tags?.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get all unique categories across all components
 */
export function getAllCategories(): string[] {
  const allComponents = getAllComponents();
  const categorySet = new Set<string>();

  allComponents.forEach((component) => {
    if (component.category) {
      categorySet.add(component.category);
    }
  });

  return Array.from(categorySet).sort();
}

/**
 * Filter components by tags
 */
export function getComponentsByTags(tags: string[]): ComponentWithLibrary[] {
  const allComponents = getAllComponents();
  return allComponents.filter((component) =>
    tags.some((tag) => component.tags?.includes(tag))
  );
}

/**
 * Filter components by category
 */
export function getComponentsByCategory(
  category: string
): ComponentWithLibrary[] {
  const allComponents = getAllComponents();
  return allComponents.filter((component) => component.category === category);
}
