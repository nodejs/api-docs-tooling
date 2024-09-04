import {
  DEFAULT_EXPRESSION,
  LEADING_HYPHEN,
  NAME_EXPRESSION,
  RETURN_EXPRESSION,
  TYPE_EXPRESSION,
} from '../constants.mjs';
import { buildHierarchy } from './buildHierarchy.mjs';
import parseSignature from './parseSignature.mjs';
import { getRemarkRehype } from '../../../utils/remark.mjs';
import { transformNodesToString } from '../../../utils/unist.mjs';

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
 * Parses a list item to extract properties.
 * @param {import('mdast').ListItem} child - The list item node.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry containing raw content.
 * @returns {import('../types.d.ts').List} The parsed list.
 */
function parseListItem(child, entry) {
  const current = {};

  /**
   * Extracts raw content from a node based on its position.
   * @param {import('mdast').BlockContent} node
   * @returns {string}
   */
  const getRawContent = node =>
    entry.rawContent.slice(
      node.position.start.offset,
      node.position.end.offset
    );

  /**
   * Extracts a pattern from text and assigns it to the current object.
   * @param {string} text
   * @param {RegExp} pattern
   * @param {string} key
   * @returns {string}
   */
  const extractPattern = (text, pattern, key) => {
    const [, match] = text.match(pattern) || [];
    if (match) {
      current[key] = match.trim().replace(/\.$/, '');
      return text.replace(pattern, '');
    }
    return text;
  };

  // Combine and clean text from child nodes, excluding nested lists
  current.textRaw = child.children
    .filter(node => node.type !== 'list')
    .map(getRawContent)
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/<!--.*?-->/gs, '');

  let text = current.textRaw;

  // Determine if the current item is a return statement
  if (RETURN_EXPRESSION.test(text)) {
    current.name = 'return';
    text = text.replace(RETURN_EXPRESSION, '');
  } else {
    text = extractPattern(text, NAME_EXPRESSION, 'name');
  }

  // Extract type and default values if present
  text = extractPattern(text, TYPE_EXPRESSION, 'type');
  text = extractPattern(text, DEFAULT_EXPRESSION, 'default');

  // Assign the remaining text as the description after removing leading hyphens
  current.desc = text.replace(LEADING_HYPHEN, '').trim() || undefined;

  // Recursively parse nested options if a list is found within the list item
  const optionsNode = child.children.find(child => child.type === 'list');
  if (optionsNode) {
    current.options = optionsNode.children.map(child =>
      parseListItem(child, entry)
    );
  }

  return current;
}

/**
 * Parses stability metadata and adds it to the section.
 * @param {import('../types.d.ts').Section} section - The section to add stability to.
 * @param {Array} nodes - The AST nodes.
 */
function parseStability(section, nodes) {
  nodes.forEach((node, i) => {
    if (
      node.type === 'blockquote' &&
      node.children.length === 1 &&
      node.children[0].type === 'paragraph' &&
      nodes.slice(0, i).every(n => n.type === 'list')
    ) {
      const text = transformNodesToString(node.children[0].children);
      const stabilityMatch = /^Stability: ([0-5])(?:\s*-\s*)?(.*)$/s.exec(text);
      if (stabilityMatch) {
        section.stability = Number(stabilityMatch[1]);
        section.stabilityText = stabilityMatch[2].replace(/\n/g, ' ').trim();
        nodes.splice(i, 1); // Remove the matched stability node to prevent further processing
      }
    }
  });
}

/**
 * Parses a list and updates the section accordingly.
 * @param {import('../types.d.ts').Section} section - The section to update.
 * @param {Array} nodes - The AST nodes.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The associated entry.
 */
function parseList(section, nodes, entry) {
  const list = nodes[0]?.type === 'list' ? nodes.shift() : null;
  const values = list
    ? list.children.map(child => parseListItem(child, entry))
    : [];

  switch (section.type) {
    case 'ctor':
    case 'classMethod':
    case 'method':
      section.signatures = [parseSignature(section.textRaw, values)];
      break;
    case 'property':
      if (values.length) {
        const { type, ...rest } = values[0];
        if (type) section.propertySigType = type;
        Object.assign(section, rest);
        section.textRaw = `\`${section.name}\` ${section.textRaw}`;
      }
      break;
    case 'event':
      section.params = values;
      break;
    default:
      if (list) nodes.unshift(list); // If the list wasn't processed, add it back for further processing
  }
}

/**
 * Adds a description to the section.
 * @param {import('../types.d.ts').Section} section - The section to add description to.
 * @param {Array} nodes - The AST nodes.
 */
function addDescription(section, nodes) {
  if (!nodes.length) return;

  if (section.desc) {
    section.shortDesc = section.desc;
  }

  const html = getRemarkRehype();
  const rendered = html.stringify(
    html.runSync({ type: 'root', children: nodes })
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

/**
 * Promotes children to top-level if the section type is 'misc'.
 * @param {import('../types.d.ts').Section} section - The section to promote.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 */
const makeChildrenTopLevelIfMisc = (section, parentSection) => {
  if (section.type !== 'misc' || parentSection.type === 'misc') {
    return;
  }

  Object.keys(section).forEach(key => {
    if (['textRaw', 'name', 'type', 'desc', 'miscs'].includes(key)) {
      return;
    }
    if (parentSection[key]) {
      parentSection[key] = Array.isArray(parentSection[key])
        ? parentSection[key].concat(section[key])
        : section[key];
    } else {
      parentSection[key] = section[key];
    }
  });
};

/**
 * Handles an entry and updates the parent section.
 * @param {import('../types.d.ts').HierarchizedEntry} entry - The entry to handle.
 * @param {import('../types.d.ts').Section} parentSection - The parent section.
 */
function handleEntry(entry, parentSection) {
  const [headingNode, ...nodes] = structuredClone(entry.content.children);
  const section = createSection(entry, headingNode);

  parseStability(section, nodes);
  parseList(section, nodes, entry);
  addDescription(section, nodes);
  entry.hierarchyChildren?.forEach(child => handleEntry(child, section));
  addAdditionalMetadata(section, parentSection, headingNode);
  addToParent(section, parentSection);
  makeChildrenTopLevelIfMisc(section, parentSection);

  if (section.type === 'property') {
    if (section.propertySigType) {
      section.type = section.propertySigType;
      delete section.propertySigType;
    } else {
      delete section.type;
    }
  }
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
