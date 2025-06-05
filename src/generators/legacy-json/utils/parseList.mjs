import {
  DEFAULT_EXPRESSION,
  LEADING_HYPHEN,
  NAME_EXPRESSION,
  RETURN_EXPRESSION,
  TYPE_EXPRESSION,
} from '../constants.mjs';
import parseSignature from './parseSignature.mjs';
import { transformNodesToString } from '../../../utils/unist.mjs';

/**
 * Modifies type references in a string by replacing template syntax (`<...>`) with curly braces `{...}`
 * and normalizing formatting.
 * @param {string} string
 * @returns {string}
 */
export function transformTypeReferences(string) {
  return string.replace(/`<([^>]+)>`/g, '{$1}').replaceAll('} | {', '|');
}

/**
 * Extracts and removes a specific pattern from a text string while storing the result in a key of the `current` object.
 * @param {string} text
 * @param {RegExp} pattern
 * @param {string} key
 * @param {Object} current
 * @returns {string}
 */
export const extractPattern = (text, pattern, key, current) => {
  const match = text.match(pattern)?.[1]?.trim().replace(/\.$/, '');

  if (!match) {
    return text;
  }

  current[key] = match;
  return text.replace(pattern, '');
};

/**
 * Parses an individual list item node to extract its properties
 *
 * @param {import('@types/mdast').ListItem} child
 * @returns {import('../types').ParameterList}
 */
export function parseListItem(child) {
  const current = {};

  // Extract and clean raw text from the node, excluding nested lists
  current.textRaw = transformTypeReferences(
    transformNodesToString(child.children.filter(node => node.type !== 'list'))
      .replace(/\s+/g, ' ')
      .replace(/<!--.*?-->/gs, '')
  );

  let text = current.textRaw;

  // Identify return items or extract key properties (name, type, default) from the text
  if (RETURN_EXPRESSION.test(text)) {
    current.name = 'return';
    text = text.replace(RETURN_EXPRESSION, '');
  } else {
    text = extractPattern(text, NAME_EXPRESSION, 'name', current);
  }

  text = extractPattern(text, TYPE_EXPRESSION, 'type', current);
  text = extractPattern(text, DEFAULT_EXPRESSION, 'default', current);

  // Set the remaining text as the description, removing any leading hyphen
  current.desc = text.replace(LEADING_HYPHEN, '').trim() || undefined;

  // Parse nested lists (options) recursively if present
  const optionsNode = child.children.find(node => node.type === 'list');
  if (optionsNode) {
    current.options = optionsNode.children.map(parseListItem);
  }

  return current;
}

/**
 * Parses a list of nodes and updates the corresponding section object with the extracted information.
 * Handles different section types such as methods, properties, and events differently.
 * @param {import('../types').Section} section
 * @param {import('@types/mdast').RootContent[]} nodes
 */
export function parseList(section, nodes) {
  const list = nodes[0]?.type === 'list' ? nodes.shift() : null;

  const values = list ? list.children.map(parseListItem) : [];

  // Update the section based on its type and parsed values
  switch (section.type) {
    case 'ctor':
    case 'classMethod':
    case 'method':
      // For methods and constructors, parse and attach signatures
      section.signatures = [parseSignature(section.textRaw, values)];
      break;

    case 'property':
      // For properties, update type and other details if values exist
      if (values.length) {
        const { type, ...rest } = values[0];
        section.type = type;
        Object.assign(section, rest);
        section.textRaw = `\`${section.name}\` ${section.textRaw}`;
      }
      break;

    case 'event':
      // For events, assign parsed values as parameters
      section.params = values;
      break;

    default:
      // If no specific handling, re-add the list for further processing
      if (list) {
        nodes.unshift(list);
      }
  }
}
