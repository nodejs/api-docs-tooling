// @ts-check
'use strict';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

/**
 * Mapping of {@link HeadingMetadataEntry['type']} to types defined in the
 * JSON schema.
 */
const ENTRY_TO_SECTION_TYPE = /** @type {const} */ ({
  module: 'module',
  class: 'class',
  ctor: 'method',
  method: 'method',
  classMethod: 'method',
  property: 'property',
  misc: 'text',
  text: 'text',
});

/**
 * Converts a value to an array.
 * @template T
 * @param {T | T[]} val - The value to convert.
 * @returns {T[]} The value as an array.
 */
const enforceArray = val => (Array.isArray(val) ? val : [val]);

/**
 *
 */
export const createSectionBaseBuilder = () => {
  /**
   * @param {import('mdast').RootContent} headingNode
   * @param {number} depth
   * @returns {typeof ENTRY_TO_SECTION_TYPE[string]}
   */
  const determineType = (headingNode, depth) => {
    const fallback = depth === 1 ? 'module' : 'text';

    return ENTRY_TO_SECTION_TYPE[headingNode?.data.type ?? fallback];
  };

  /**
   * Adds a description to the section base.
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {Array} nodes
   */
  const addDescriptionAndExamples = (section, nodes) => {
    nodes.forEach(node => {
      /**
       * @type {string | undefined}
       */
      let content;

      switch (node.type) {
        case 'paragraph': {
          addDescriptionAndExamples(section, node.children);

          break;
        }
        case 'emphasis': {
          addDescriptionAndExamples(section, node.children);
          break;
        }
        case 'inlineCode': {
          content = `\`${node.value}\``;
          break;
        }
        case 'text': {
          content = node.value;
          break;
        }
        case 'link': {
          if (node.label) {
            // Standard link to some resource
            content = `[${node.label}](${node.url})`;
          } else {
            // Missing the label, let's see if it's a reference to a global
            const childNode = node.children[0];

            if (childNode && childNode.type === 'inlineCode') {
              content = `[${childNode.value}](${node.url})`;
            } else {
              console.error('not', childNode);
            }
          }

          break;
        }
        case 'code': {
          // TODO this is kinda ugly
          if (Array.isArray(section['@example'])) {
            section['@example'] = [...section['@example'], node.value];
          } else if (section['@example']) {
            section['@example'] = [section['@example'], node.value];
          } else {
            section['@example'] = node.value;
          }

          break;
        }
        default: {
          // No content to add to description
          break;
        }
      }

      if (content) {
        // Create the description property if it doesn't already exist
        section.description ??= '';

        // Add this nodes' content to the description
        section.description += content;
      }
    });
  };

  /**
   * TODO docs
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
   * TODO docs
   * @param {import('../generated.d.ts').SectionBase} section
   * @param {HierarchizedEntry} entry
   */
  const addStabilityStatus = (section, entry) => {
    const stability = entry.stability.children.map(node => node.data)?.[0];

    if (!stability) {
      return;
    }

    section.stability = {
      value: stability.index,
      text: stability.description,
    };
  };

  /**
   * TODO docs
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
   * @returns {import('../generated.d.ts').SectionBase}
   */
  return entry => {
    const [headingNode, ...nodes] = entry.content.children;

    const type = determineType(headingNode, entry.heading.depth);

    /**
     * @type {import('../generated.d.ts').SectionBase}
     */
    const base = {
      type,
      '@name': headingNode.data.name,
    };

    addDescriptionAndExamples(base, nodes);
    addDeprecatedStatus(base, entry);
    addStabilityStatus(base, entry);
    addVersionProperties(base, entry);

    return base;
  };
};
