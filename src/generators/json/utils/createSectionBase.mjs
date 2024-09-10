// @ts-check
'use strict';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

const MARKDOWN_TO_SECTION_TYPE = {
  module: 'module',
  class: 'class',
  ctor: 'method',
  method: 'method',
  classMethod: 'method',
  property: 'property',
  misc: 'text',
  text: 'text',
};

/**
 * Converts a value to an array.
 * @template T
 * @param {T | T[]} val - The value to convert.
 * @returns {T[]} The value as an array.
 */
const enforceArray = val => (Array.isArray(val) ? val : [val]);

export const createSectionBaseBuilder = () => {
  /**
   * Adds a description to the section base.
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {Array} nodes
   */
  const addDescriptionAndExamples = (section, nodes) => {
    section.description = 'TODO';
  };

  /**
   * TODO
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {HierarchizedEntry} entry
   */
  const addDeprecatedStatus = (section, entry) => {
    if (!entry.deprecated_in) {
      return;
    }

    section['@deprecated'] = enforceArray(entry.deprecated_in);
  };

  /**
   * TODO
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {Array} nodes The remaining AST nodes
   * @param {HierarchizedEntry} entry
   */
  const addStabilityStatus = (section, nodes, entry) => {
    const stability = entry.stability.toJSON()?.[0];

    if (!stability) {
      return;
    }

    section.stability = {
      value: stability.index,
      text: stability.description,
    };

    // Remove the stability node from processing
    nodes.shift();
  };

  /**
   * TODO
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {HierarchizedEntry} entry
   */
  const addVersionProperties = (section, entry) => {
    if (entry.changes.length > 0) {
      section.changes = entry.changes.map(change => ({
        description: change.description,
        prUrl: change['pr-url'],
        version: enforceArray(change.version),
      }));
    }

    if (entry.added_in) {
      section['@since'] = enforceArray(entry.added_in);
    }

    if (entry.n_api_version) {
      section.napiVersion = enforceArray(entry.n_api_version);
    }

    if (entry.removed_in) {
      section.removedIn = enforceArray(entry.removed_in);
    }
  };

  /**
   * Returns an object containing the properties that can be found in every
   * section type that we have.
   *
   * @param {HierarchizedEntry} entry The AST entry
   * @param {HeadingMetadataEntry['type'] | undefined} type The type of the entry
   * @returns {import('../generated.d.ts').SectionBase}
   */
  return (entry, parentType) => {
    const [headingNode, ...nodes] = structuredClone(entry.content.children);

    /**
     * @type {import('../generated.d.ts').SectionBase}
     */
    const base = {
      type: MARKDOWN_TO_SECTION_TYPE[headingNode.data.type ?? parentType ?? 'module'],
      '@name': headingNode.data.name,
    };

    addDescriptionAndExamples(base, nodes);
    addDeprecatedStatus(base, entry);
    addStabilityStatus(base, nodes, entry);
    addVersionProperties(base, entry);

    return base;
  };
};
