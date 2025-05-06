// @ts-check
'use strict';

import { findParentSection } from './findParentSection.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createMethodSectionBuilder = () => {
  /**
   * TODO docs
   * @param {HierarchizedEntry} entry The AST entry
   * @returns {Record<string, import('../generated.d.ts').MethodParameter> | undefined}
   */
  const parseParameters = entry => {
    const [, ...nodes] = entry.content.children;

    const listNode = nodes.find(node => node.type === 'list');

    if (!listNode) {
      // Method doesn't take in any parameters
      return undefined;
    }

    /**
     * @type {Record<string, import('../generated.d.ts').MethodParameter>}
     */
    const parameters = {};

    listNode.children.forEach(({ children }) => {
      // console.log(children)
      // if (children.length !== 1) {
      //   console.log(JSON.stringify(children, null, 2))
      // }
    });

    return parameters;
  };

  /**
   * TODO docs
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Method} section The method section
   */
  const parseSignatures = (entry, section) => {
    section.signatures = [];

    // Parse all the parameters and store them in a name:section map
    const parameters = parseParameters(entry, section);

    // Parse the value of entry.heading.data.text to get the order of parameters and which are optional
    // console.log(entry.heading.data.text);
  };

  /**
   * Adds the properties expected in a method section to an object.
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Method} section The method section
   */
  return (entry, section) => {
    parseSignatures(entry, section);

    const parent = findParentSection(section, ['class', 'module']);

    // Add this section to the parent if it exists
    if (parent) {
      // Put static methods in `staticMethods` property and non-static methods
      // in the `methods` property
      const property = entry.heading.data.text.startsWith('Static method:')
        ? 'staticMethods'
        : 'methods';

      if (!Array.isArray(parent[property])) {
        throw new TypeError(
          `expected parent[${property}] to be an array, got type ${typeof parent[property]} instead (parent type=${parent.type})`
        );
      }

      parent[property].push(section);
    }
  };
};
