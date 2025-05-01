// @ts-check
'use strict';

import { findParentSection } from './findParentSection.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createMethodSectionBuilder = () => {
  /**
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Method} section The method section
   */
  const parseSignatures = (entry, section) => {
    section.signatures = [];
  };

  /**
   * Adds the properties expected in a method section to an object.
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Method} section The method section
   */
  return (entry, section) => {
    parseSignatures(entry, section);

    // TODO are there any other places that an exposed method can be defined?
    const parent = findParentSection(section, ['class', 'module']);

    // Add this section to the parent if it exists
    if (parent) {
      if (!Array.isArray(parent.methods)) {
        throw new TypeError(
          `expected parent.methods to be an array, got type ${typeof parent.methods} instead (parent type=${parent.type})`
        );
      }

      parent.methods.push(section);
    }
  };
};
