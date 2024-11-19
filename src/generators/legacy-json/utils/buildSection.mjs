import { buildHierarchy } from './buildHierarchy.mjs';
import { getRemarkRehype } from '../../../utils/remark.mjs';
import { transformNodesToString } from '../../../utils/unist.mjs';
import { parseList } from './parseList.mjs';

const sectionTypePlurals = {
  module: 'modules',
  misc: 'miscs',
  class: 'classes',
  method: 'methods',
  property: 'properties',
  global: 'globals',
  example: 'examples',
  ctor: 'signatures',
  classMethod: 'classMethods',
  event: 'events',
  var: 'vars',
};

/**
 * Converts a value to an array.
 * @template T
 * @param {T | T[]} val - The value to convert.
 * @returns {T[]} The value as an array.
 */
const enforceArray = val => (Array.isArray(val) ? val : [val]);

/**
 * Creates metadata from a hierarchized entry.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to create metadata from.
 * @returns {import('../types.d.ts').Meta} The created metadata.
 */
function createMeta(entry) {
  const {
    added_in = [],
    n_api_version = [],
    deprecated_in = [],
    removed_in = [],
    changes,
  } = entry;

  return {
    changes,
    added: enforceArray(added_in),
    napiVersion: enforceArray(n_api_version),
    deprecated: enforceArray(deprecated_in),
    removed: enforceArray(removed_in),
  };
}

/**
 * Creates a section from an entry and its heading.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The AST entry.
 * @param {HeadingMetadataParent} head - The head node of the entry.
 * @returns {import('../types.d.ts').Section} The created section.
 */
function createSection(entry, head) {
  return {
    textRaw: transformNodesToString(head.children),
    name: head.data.name,
    type: head.data.type,
    meta: createMeta(entry),
    introduced_in: entry.introduced_in,
  };
}

/**
 * Parses stability metadata and adds it to the section.
 * @param {import('../types.d.ts').Section} section - The section to add stability to.
 * @param {Array} nodes - The AST nodes.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to handle.
 */
function parseStability(section, nodes, entry) {
  const json = entry.stability.toJSON()[0];
  if (json) {
    section.stability = json.index;
    section.stabilityText = json.description;
    nodes.splice(0, 1);
  }
}

let lazyHTML;

/**
 * Adds a description to the section.
 * @param {import('../types.d.ts').Section} section - The section to add description to.
 * @param {Array} nodes - The AST nodes.
 */
function addDescription(section, nodes) {
  if (!nodes.length) {
    return;
  }

  if (section.desc) {
    section.shortDesc = section.desc;
  }

  lazyHTML ??= getRemarkRehype();

  const rendered = lazyHTML.stringify(
    lazyHTML.runSync({ type: 'root', children: nodes })
  );

  section.desc = rendered || undefined;
}

/**
 * Adds additional metadata to the section based on its type.
 * @param {import('../types.d.ts').Section} section - The section to update.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 * @param {import('../../types.d.ts').NodeWithData} headingNode - The heading node.
 */
function addAdditionalMetadata(section, parentSection, headingNode) {
  if (!section.type) {
    section.name = section.textRaw.toLowerCase().trim().replace(/\s+/g, '_');
    section.displayName = headingNode.data.name;
    section.type = parentSection.type === 'misc' ? 'misc' : 'module';
  }
}

/**
 * Adds the section to its parent section.
 * @param {import('../types.d.ts').Section} section - The section to add.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 */
function addToParent(section, parentSection) {
  const pluralType = sectionTypePlurals[section.type];

  parentSection[pluralType] = parentSection[pluralType] || [];
  parentSection[pluralType].push(section);
}

const notTransferredKeys = ['textRaw', 'name', 'type', 'desc', 'miscs'];

/**
 * Promotes children properties to the parent level if the section type is 'misc'.
 *
 * @param {import('../types.d.ts').Section} section - The section to promote.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 */
const makeChildrenTopLevelIfMisc = (section, parentSection) => {
  // Only promote if the current section is of type 'misc' and the parent is not 'misc'
  if (section.type === 'misc' && parentSection.type !== 'misc') {
    Object.entries(section).forEach(([key, value]) => {
      // Skip keys that should not be transferred
      if (notTransferredKeys.includes(key)) return;

      // Merge the section's properties into the parent section
      parentSection[key] = parentSection[key]
        ? // If the parent already has this key, concatenate the values
          [].concat(parentSection[key], value)
        : // Otherwise, directly assign the section's value to the parent
          value;
    });
  }
};

const handleChildren = (entry, section) => {
  entry.hierarchyChildren?.forEach(child => handleEntry(child, section));
};

/**
 * Handles an entry and updates the parent section.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to handle.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 */
function handleEntry(entry, parentSection) {
  const [headingNode, ...nodes] = structuredClone(entry.content.children);
  const section = createSection(entry, headingNode);

  parseStability(section, nodes, entry);
  parseList(section, nodes);
  addDescription(section, nodes);
  handleChildren(entry, section);
  addAdditionalMetadata(section, parentSection, headingNode);
  addToParent(section, parentSection);
  makeChildrenTopLevelIfMisc(section, parentSection);
}

/**
 * Builds the module section from head and entries.
 * @param {ApiDocMetadataEntry} head - The head metadata entry.
 * @param {Array<ApiDocMetadataEntry>} entries - The list of metadata entries.
 * @returns {import('../types.d.ts').ModuleSection} The constructed module section.
 */
export default (head, entries) => {
  const rootModule = {
    type: 'module',
    source: head.api_doc_source,
  };

  buildHierarchy(entries).forEach(entry => handleEntry(entry, rootModule));

  return rootModule;
};
