import { buildHierarchy } from './buildHierarchy.mjs';

const sectionTypePlurals = {
  module: 'modules',
  misc: 'miscs',
  class: 'classes',
  method: 'methods',
  property: 'properties',
  global: 'globals',
  example: 'examples',
  ctor: 'ctors',
  classMethod: 'classMethods',
  event: 'events',
  var: 'vars',
};

/**
 *
 * @param {HeadingMetadataParent} entry
 * @returns {import('../types.d.ts').Section}
 */
function createSection(entry) {
  const text = textJoin(entry.children);

  // TODO check if type or name can be undefined
  return {
    textRaw: text,
    type: entry.data.type,
    name: entry.data.name,
  };
}

/**
 *
 * @param {*} values TODO type
 * @returns {import('../types.d.ts').MethodSignature}
 */
function parseSignature(values) {
  /**
   * @type {import('../types.d.ts').MethodSignature}
   */
  const signature = {};

  signature.params = values.filter(value => {
    if (value.name === 'return') {
      signature.return = value;
      return false;
    }

    return true;
  });

  return signature;
}

/**
 *
 * @param {import('mdast').PhrasingContent[]} nodes
 */
function textJoin(nodes) {
  return nodes
    .map(node => {
      switch (node.type) {
        case 'linkReference':
          console.error(`todo link reference`);
          return `TODO`;
        case `strong`:
          return `**${textJoin(node.children)}**`;
        case `emphasis`:
          return `_${textJoin(node.children)}_`;
        default:
          if (node.children) {
            return textJoin(node.children);
          }

          return node.value;
      }
    })
    .join('');
}

/**
 * @param {import('../types.d.ts').HierarchizedEntry} entry
 * @returns {import('../types.d.ts').Meta | undefined}
 */
function createMeta(entry) {
  const makeArrayIfNotAlready = val => (Array.isArray(val) ? val : [val]);

  const { added_in, n_api_version, deprecated_in, removed_in, changes } = entry;
  if (added_in || n_api_version || deprecated_in || removed_in) {
    return {
      changes,
      added: makeArrayIfNotAlready(added_in),
      napiVersion: makeArrayIfNotAlready(n_api_version),
      deprecated: makeArrayIfNotAlready(deprecated_in),
      removed: makeArrayIfNotAlready(removed_in),
    };
  }

  return undefined;
}

function parseListItem() {
  return { type: 'asd' };
}

/**
 *
 * @param {import('../types.d.ts').HierarchizedEntry} entry
 * @param {import('../types.d.ts').Section} parentSection
 */
function handleEntry(entry, parentSection) {
  let [headingNode, ...nodes] = structuredClone(entry.content.children);

  const section = createSection(headingNode);
  section.meta = createMeta(entry);

  const pluralType = sectionTypePlurals[section.type];
  if (!(pluralType in parentSection)) {
    parentSection[pluralType] = [];
  }
  parentSection[sectionTypePlurals[section.type]].push(section);

  // Remove metadata not directly inferable from the markdown
  nodes.forEach((node, i) => {
    if (
      node.type === 'blockquote' &&
      node.children.length === 1 &&
      node.children[0].type === 'paragraph' &&
      nodes.slice(0, i).every(node => node.type === 'list')
    ) {
      const text = textJoin(node.children[0].children);
      const stability = /^Stability: ([0-5])(?:\s*-\s*)?(.*)$/s.exec(text);
      if (stability) {
        section.stability = parseInt(stability[1], 10);
        section.stabilityText = stability[2].replaceAll('\n', ' ').trim();
        delete nodes[i];
      }
    }
  });

  // Compress the node array.
  nodes = nodes.filter(() => true);

  const list = nodes.length && nodes[0].type === 'list' ? nodes.shift() : null;

  if (list) {
    const values = list ? list.children.map(child => parseListItem(child)) : [];

    switch (section.type) {
      case 'ctor':
      case 'classMethod':
      case 'method': {
        const signature = parseSignature(values);
        section.signatures = [signature];
        break;
      }
      case 'property':
        break;
      case 'event':
        section.params = values;
        break;
      default:
        // List wasn't consumed, add it back
        nodes.unshift(list);
    }
  }

  if (nodes.length) {
    if (section.desc) {
      section.shortDesc = section.desc;
    }

    // TODO: parse definitions
  }

  // Handle our children if we have them
  if (entry.hierarchyChildren) {
    entry.hierarchyChildren.forEach(child => handleEntry(child, section));
  }

  // TODO: the cleanup work the current parser does
}

/**
 * @param {ApiDocMetadataEntry} head
 * @param {Array<ApiDocMetadataEntry>} entries
 * @returns {import('../types.d.ts').ModuleSection}
 */
export default (head, entries) => {
  /**
   * @type {import('../types.d.ts').ModuleSection}
   */
  const module = {
    type: 'module',
    source: `doc/api/${head.api_doc_source}`,
  };

  buildHierarchy(entries).forEach(entry => handleEntry(entry, module));

  return module;
};
