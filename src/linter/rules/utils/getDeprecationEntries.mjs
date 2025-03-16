'use strict';

/**
 * @param {Array<import('../../../generators/legacy-json/types').HierarchizedEntry>} hierarchy
 * @returns {Array<import('../../../generators/legacy-json/types').HierarchizedEntry> | undefined}
 */
export default function getDeprecationEntries(hierarchy) {
  for (const child of hierarchy) {
    if (child.slug === 'list-of-deprecated-apis') {
      return child.hierarchyChildren;
    }
  }

  return undefined;
}
