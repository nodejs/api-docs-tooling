// @ts-check
'use strict';

import { findParentSection } from './findParentSection.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createClassSectionBuilder = () => {
  /**
   * Adds the properties expected in a class section to an object.
   * @param {import('../generated.d.ts').Class} section The class section
   */
  return section => {
    section['@constructor'] = [];

    section.methods = [];

    section.staticMethods = [];

    section.properties = [];

    const parent = findParentSection(section, 'module');

    if (parent) {
      if (!Array.isArray(parent.classes)) {
        throw new TypeError(
          `expected parent.classes to be an array, got ${typeof parent.classes}`
        );
      }

      parent.classes.push(section);
    }
  };
};
