import { buildHierarchy } from './buildHierarchy.mjs';
import { getRemarkRehype } from '../../../utils/remark.mjs';
import { transformNodesToString } from '../../../utils/unist.mjs';
import { parseList } from './parseList.mjs';
import { SECTION_TYPE_PLURALS, UNPROMOTED_KEYS } from '../constants.mjs';

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
export const createSectionBuilder = () => {
  const html = getRemarkRehype();

  /**
   * Creates metadata from a hierarchized entry.
   * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to create metadata from.
   * @returns {import('../types.d.ts').Meta} The created metadata.
   */
  const createMeta = ({
    added_in = [],
    n_api_version = [],
    deprecated_in = [],
    removed_in = [],
    changes,
  }) => ({
    changes,
    added: enforceArray(added_in),
    napiVersion: enforceArray(n_api_version),
    deprecated: enforceArray(deprecated_in),
    removed: enforceArray(removed_in),
  });

  /**
   * Creates a section from an entry and its heading.
   * @param {import('../types.d.ts').HierarchizedEntry} entry - The AST entry.
   * @param {HeadingMetadataParent} head - The head node of the entry.
   * @returns {import('../types.d.ts').Section} The created section.
   */
  const createSection = (entry, head) => ({
    textRaw: transformNodesToString(head.children),
    name: head.data.name,
    type: head.data.type,
    meta: createMeta(entry),
    introduced_in: entry.introduced_in,
  });

  /**
   * Parses stability metadata and adds it to the section.
   * @param {import('../types.d.ts').Section} section - The section to update.
   * @param {Array} nodes - The remaining AST nodes.
   * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry providing stability information.
   */
  const parseStability = (section, nodes, { stability }) => {
    const stabilityInfo = stability.toJSON()?.[0];

    if (stabilityInfo) {
      section.stability = stabilityInfo.index;
      section.stabilityText = stabilityInfo.description;
      nodes.shift(); // Remove stability node from processing
    }
  };

  /**
   * Adds a description to the section.
   * @param {import('../types.d.ts').Section} section - The section to update.
   * @param {Array} nodes - The remaining AST nodes.
   */
  const addDescription = (section, nodes) => {
    if (!nodes.length) {
      return;
    }

    const rendered = html.stringify(
      html.runSync({ type: 'root', children: nodes })
    );

    section.shortDesc = section.desc || undefined;
    section.desc = rendered || undefined;
  };

  /**
   * Adds additional metadata to the section based on its type.
   * @param {import('../types.d.ts').Section} section - The section to update.
   * @param {import('../types.d.ts').Section} parent - The parent section.
   * @param {import('../../types.d.ts').NodeWithData} heading - The heading node of the section.
   */
  const addAdditionalMetadata = (section, parent, heading) => {
    if (!section.type) {
      section.name = section.textRaw.toLowerCase().trim().replace(/\s+/g, '_');
      section.displayName = heading.data.name;
      section.type = parent.type === 'misc' ? 'misc' : 'module';
    }
  };

  /**
   * Adds the section to its parent section.
   * @param {import('../types.d.ts').Section} section - The section to add.
   * @param {import('../types.d.ts').Section} parent - The parent section.
   */
  const addToParent = (section, parent) => {
    const key = SECTION_TYPE_PLURALS[section.type] || 'miscs';

    parent[key] ??= [];
    parent[key].push(section);
  };

  /**
   * Promotes children properties to the parent level if the section type is 'misc'.
   * @param {import('../types.d.ts').Section} section - The section to promote.
   * @param {import('../types.d.ts').Section} parent - The parent section.
   */
  const promoteMiscChildren = (section, parent) => {
    // Only promote if the current section is of type 'misc' and the parent is not 'misc'
    if (section.type === 'misc' && parent.type !== 'misc') {
      Object.entries(section).forEach(([key, value]) => {
        // Only promote certain keys
        if (!UNPROMOTED_KEYS.includes(key)) {
          // Merge the section's properties into the parent section
          parent[key] = parent[key]
            ? // If the parent already has this key, concatenate the values
              [].concat(parent[key], value)
            : // Otherwise, directly assign the section's value to the parent
              [];
        }
      });
    }
  };

  /**
   * Processes children of a given entry and updates the section.
   * @param {import('../types.d.ts').HierarchizedEntry} entry - The current entry.
   * @param {import('../types.d.ts').Section} section - The current section.
   */
  const handleChildren = ({ hierarchyChildren }, section) =>
    hierarchyChildren?.forEach(child => handleEntry(child, section));

  /**
   * Handles an entry and updates the parent section.
   * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to process.
   * @param {import('../types.d.ts').Section} parent - The parent section.
   */
  const handleEntry = (entry, parent) => {
    const [headingNode, ...nodes] = structuredClone(entry.content.children);
    const section = createSection(entry, headingNode);

    parseStability(section, nodes, entry);
    parseList(section, nodes);
    addDescription(section, nodes);
    handleChildren(entry, section);
    addAdditionalMetadata(section, parent, headingNode);
    addToParent(section, parent);
    promoteMiscChildren(section, parent);
  };

  /**
   * Builds the module section from head metadata and entries.
   * @param {ApiDocMetadataEntry} head - The head metadata entry.
   * @param {Array<ApiDocMetadataEntry>} entries - The list of metadata entries.
   * @returns {import('../types.d.ts').ModuleSection} The constructed module section.
   */
  return (head, entries) => {
    const rootModule = { type: 'module', source: head.api_doc_source };

    buildHierarchy(entries).forEach(entry => handleEntry(entry, rootModule));

    return rootModule;
  };
};
