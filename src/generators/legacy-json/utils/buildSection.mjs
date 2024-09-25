import { unified } from 'unified';
import html from 'remark-html';
import {
  DEFAULT_EXPRESSION,
  LEADING_HYPHEN,
  NAME_EXPRESSION,
  PARAM_EXPRESSION,
  RETURN_EXPRESSION,
  TYPE_EXPRESSION,
} from '../constants.mjs';
import { buildHierarchy } from './buildHierarchy.mjs';

const sectionTypePlurals = {
  module: 'modules',
  misc: 'miscs',
  class: 'classes',
  method: 'methods',
  property: 'properties',
  global: 'globals',
  example: 'examples',
  // Constructors should go under a class sections' signatures property
  ctor: 'signatures',
  classMethod: 'classMethods',
  event: 'events',
  var: 'vars',
};

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
      added: added_in ? makeArrayIfNotAlready(added_in) : undefined,
      napiVersion: n_api_version
        ? makeArrayIfNotAlready(n_api_version)
        : undefined,
      deprecated: deprecated_in
        ? makeArrayIfNotAlready(deprecated_in)
        : undefined,
      removed: removed_in ? makeArrayIfNotAlready(removed_in) : undefined,
    };
  }

  return undefined;
}

/**
 * @param {import('../types.d.ts').HierarchizedEntry} entry Section's AST entry
 * @param {HeadingMetadataParent} head Head node of the entry
 * @returns {import('../types.d.ts').Section}
 */
function createSection(entry, head) {
  const text = textJoin(head.children);

  return {
    textRaw: text,
    type: head.data.type,
    name: text.toLowerCase().replaceAll(' ', '_'),
    displayName: head.data.name,
    meta: createMeta(entry),
    introduced_in: entry.introduced_in,
  };
}

/**
 * @param {string} textRaw Something like `new buffer.Blob([sources[, options]])`
 * @param {Array<import('../types.d.ts').List} values
 * @returns {import('../types.d.ts').MethodSignature}
 */
function parseSignature(textRaw, values) {
  /**
   * @type {import('../types.d.ts').MethodSignature}
   */
  const signature = {
    params: [],
  };

  const rawParameters = values.filter(value => {
    if (value.name === 'return') {
      signature.return = value;
      return false;
    }

    return true;
  });

  /**
   * Extract a list of the signatures from the method's declaration
   * @example `[sources[, options]]`
   */
  let [, declaredParameters] = textRaw.match(PARAM_EXPRESSION) || [];

  if (!declaredParameters) {
    return;
  }

  /**
   * @type {string[]}
   * @example ['sources[,', 'options]]']
   */
  declaredParameters = declaredParameters.split(',');

  let optionalDepth = 0;
  const optionalCharDict = { '[': 1, ' ': 0, ']': -1 };

  declaredParameters.forEach((declaredParameter, i) => {
    /**
     * @example 'length]]'
     * @example 'arrayBuffer['
     * @example '[sources['
     * @example 'end'
     */
    declaredParameter = declaredParameter.trim();

    if (!declaredParameter) {
      throw new Error(`Empty parameter slot: ${textRaw}`);
    }

    // We need to find out if this parameter is optional or not. We can tell this
    //  if we're wrapped in brackets, so let's look for them.

    let pos;
    for (pos = 0; pos < declaredParameter.length; pos++) {
      const levelChange = optionalCharDict[declaredParameter[pos]];

      if (levelChange === undefined) {
        break;
      }

      optionalDepth += levelChange;
    }

    // Cut off any trailing brackets
    declaredParameter = declaredParameter.substring(pos);

    const isParameterOptional = optionalDepth > 0;

    for (pos = declaredParameter.length - 1; pos >= 0; pos--) {
      const levelChange = optionalCharDict[declaredParameter[pos]];

      if (levelChange === undefined) {
        break;
      }

      optionalDepth += levelChange;
    }

    // Cut off any leading brackets
    declaredParameter = declaredParameter.substring(0, pos + 1);

    // Default value of this parameter in the method's declaration
    let defaultValue;

    const equalSignPos = declaredParameter.indexOf('=');
    if (equalSignPos !== -1) {
      // We have a default value, save it and then cut it off of the signature
      defaultValue = declaredParameter.substring(equalSignPos, 1).trim();
      declaredParameter = declaredParameter.substring(0, equalSignPos);
    }

    let parameter = rawParameters[i];
    if (!parameter || declaredParameter !== parameter.name) {
      // If we're here then the method likely has shared signatures
      //  Something like, `new Console(stdout[, stderr][, ignoreErrors])` and
      //  `new Console(options)`
      parameter = undefined;

      // Try finding a parameter this is being shared with
      for (const otherParam of rawParameters) {
        if (declaredParameter === otherParam.name) {
          // Found a matching one
          // TODO break?
          parameter = otherParam;
        } else if (otherParam.options) {
          // Found a matching one in the parameter's options
          for (const option of otherParam.options) {
            if (declaredParameter === option.name) {
              parameter = Object.assign({}, option);
              break;
            }
          }
        }
      }

      if (!parameter) {
        // Couldn't find the shared one
        if (declaredParameter.startsWith('...')) {
          parameter = { name: declaredParameter };
        } else {
          throw new Error(
            `Invalid param "${declaredParameter}"\n` + ` > ${textRaw}`
          );
        }
      }
    }

    if (isParameterOptional) {
      parameter.optional = true;
    }

    if (defaultValue) {
      parameter.default = defaultValue;
    }

    signature.params.push(parameter);
  });

  return signature;
}

/**
 *
 * @param {Array<import('mdast').PhrasingContent>} nodes
 */
function textJoin(nodes) {
  return nodes
    .map(node => {
      switch (node.type) {
        case 'strong':
          return `**${textJoin(node.children)}**`;
        case 'emphasis':
          return `_${textJoin(node.children)}_`;
        case 'link': {
          return `[${node.label}][]`;
        }
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
 * Find name, type, default, desc properties
 * @param {import('mdast').ListItem} child
 * @returns {import('../types.d.ts').List}
 */
function parseListItem(child) {
  /**
   * @type {import('../types.d.ts').List}
   */
  const current = {};

  current.textRaw = textJoin(
    child.children.filter(node => node.type !== 'list')
  )
    .replace(/\s+/g, ' ')
    .replaceAll(/<!--.*?-->/gs, '');

  if (!current.textRaw) {
    throw new Error(`empty list item: ${JSON.stringify(child)}`);
  }

  let text = current.textRaw;

  // Extract name
  if (RETURN_EXPRESSION.test(text)) {
    current.name = 'return';

    let [, returnType] = text.match(/`(.*?)`/);
    returnType = returnType.substring(1, returnType.length - 1);
    current.type = returnType;

    text = text.replace(RETURN_EXPRESSION, '');
  } else {
    const [, name] = text.match(NAME_EXPRESSION) || [];
    if (name) {
      current.name = name;
      text = text.replace(NAME_EXPRESSION, '');
    }

    // Extract type (if provided)
    const [, type] = text.match(TYPE_EXPRESSION) || [];
    if (type) {
      current.type = type;
      text = text.replace(TYPE_EXPRESSION, '');
    }
  }

  // Remove leading hyphens
  text = text.replace(LEADING_HYPHEN, '');

  // Extract default value (if exists)
  const [, defaultValue] = text.match(DEFAULT_EXPRESSION) || [];
  if (defaultValue) {
    current.default = defaultValue.replace(/\.$/, '');
    text = text.replace(DEFAULT_EXPRESSION, '');
  }

  // Add remaining text to the desc
  if (text) {
    current.desc = text;
  }

  const options = child.children.find(child => child.type === 'list');
  if (options) {
    current.options = options.children.map(child => parseListItem(child));
  }

  return current;
}

/**
 *
 * @param {import('../types.d.ts').HierarchizedEntry} entry
 * @param {import('../types.d.ts').Section} parentSection
 */
function handleEntry(entry, parentSection) {
  // Clone the children so we don't mess with any other generators
  let [headingNode, ...nodes] = structuredClone(entry.content.children);

  /**
   * @returns {import('../types.d.ts').Section}
   */
  const setupSection = () => {
    // Create the section object with base data we know now
    const section = createSection(entry, headingNode);

    // Get the plural type of the section (e.g. 'modules' for type 'module')
    const pluralType = sectionTypePlurals[section.type];

    // Check if our parent section has a array property with the plural type
    //  already, create it if not
    if (!(pluralType in parentSection)) {
      parentSection[pluralType] = [];
    }

    // Add this section to our parent
    parentSection[sectionTypePlurals[section.type]].push(section);

    return section;
  };

  /**
   * Grabs stability number & text and adds it to the section
   * @param {import('../types.d.ts').Section} section
   */
  const parseStability = section => {
    let needsCompressing = false;

    // Remove metadata not directly the inferable from the markdown
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
          needsCompressing = true;
        }
      }
    });

    if (needsCompressing) {
      // Compress to remove the holes left by deletions
      nodes = nodes.filter(() => true);
    }
  };

  /**
   *
   * @param {import('../types.d.ts').Section} section
   */
  const parseListIfThereIsOne = section => {
    const list =
      nodes.length && nodes[0].type === 'list' ? nodes.shift() : null;
    if (!list) {
      return;
    }

    /**
     * @type {Array<import('../types.d.ts').List>}
     */
    const values = list ? list.children.map(child => parseListItem(child)) : [];
    switch (section.type) {
      case 'ctor':
      case 'classMethod':
      case 'method': {
        section.signatures = [parseSignature(section.textRaw, values)];

        break;
      }

      case 'property': {
        if (!values.length) {
          break;
        }

        const signature = values[0];
        signature.textRaw = `\`${section.name}\` ${signature.textRaw}`;

        for (const key in signature) {
          if (!signature[key]) {
            continue;
          }

          if (key === 'type') {
            // We'll set propertySigType to type at the end since we still need the
            //  original type for a few more checks
            section.propertySigType = signature.type;
          } else {
            section[key] = signature[key];
          }
        }

        break;
      }

      case 'event':
        section.params = values;
        break;

      default:
        // List wasn't consumed, add it back
        nodes.unshift(list);
    }
  };

  /**
   * @param {import('../types.d.ts').Section} section
   */
  const addDescription = section => {
    if (nodes.length === 0) {
      return;
    }

    if (section.desc) {
      section.shortDesc = section.desc;
    }

    // Render the description as if it was html
    section.desc = unified()
      .use(function () {
        this.Parser = () => ({ type: 'root', children: nodes });
      })
      .use(html, { sanitize: false })
      .processSync('')
      .toString()
      .trim();

    if (!section.desc) {
      // Rendering returned nothing
      delete section.desc;
    }
  };

  /**
   * Creates the sections for the children of this entry
   * @param {import('../types.d.ts').Section} section
   */
  const handleChildren = section => {
    if (!entry.hierarchyChildren) {
      return;
    }

    entry.hierarchyChildren.forEach(child => handleEntry(child, section));
  };

  /**
   * @param {import('../types.d.ts').Section} section
   * @param {import('../types.d.ts').Section} parentSection
   */
  const makeChildrenTopLevelIfMisc = (section, parentSection) => {
    if (parentSection.type !== 'misc') {
      return;
    }

    for (const key of Object.keys(section)) {
      if (key in ['textRaw', 'name', 'type', 'desc', 'miscs']) {
        continue;
      }

      if (parentSection[key]) {
        if (Array.isArray(parentSection[key])) {
          parentSection[key] = parentSection[key].concat(section[key]);
        }
      } else {
        parentSection[key] = section[key];
      }
    }
  };

  const section = setupSection();

  parseStability(section);

  parseListIfThereIsOne(section);

  addDescription(section);

  handleChildren(section);

  makeChildrenTopLevelIfMisc(section, parentSection);

  if (section.type === 'property') {
    if (section.propertySigType) {
      section.type = section.propertySigType;
      section.propertySigType = undefined;
    } else {
      // Delete the type here because ???
      section.type = undefined;
    }
  }
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
  const rootModule = {
    type: 'module',
    source: `doc/api/${head.api_doc_source}`,
  };

  buildHierarchy(entries).forEach(entry => handleEntry(entry, rootModule));

  return rootModule;
};
