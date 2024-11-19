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
 * Transforms type references in a string by replacing template syntax with curly braces and cleaning up.
 * @param {String} string
 * @returns {String}
 */
function transformTypeReferences(string) {
  return string.replace(/`<([^>]+)>`/g, '{$1}').replaceAll('} | {', '|');
}

/**
 * Extracts a matching pattern from a text and assigns it to the current object.
 * @param {string} text
 * @param {RegExp} pattern
 * @param {string} key
 * @param {Object} current
 * @returns {string}
 */
const extractPattern = (text, pattern, key, current) => {
  const match = text.match(pattern)?.[1]?.trim().replace(/\.$/, '');
  if (match) {
    current[key] = match;
    return text.replace(pattern, '');
  }
  return text;
};

/**
 * Parses a list item node to extract key properties.
 * @param {import('mdast').ListItem} child - The list item node.
 * @returns {import('../types').ParameterList} The parsed list item.
 */
function parseListItem(child) {
  const current = {};

  // Clean up and transform the raw text
  current.textRaw = transformTypeReferences(
    transformNodesToString(
      child.children.filter(node => node.type !== 'list'),
      true
    )
      .replace(/\s+/g, ' ')
      .replace(/<!--.*?-->/gs, '')
  );

  let text = current.textRaw;

  // Determine the item type and extract relevant details
  if (RETURN_EXPRESSION.test(text)) {
    current.name = 'return';
    text = text.replace(RETURN_EXPRESSION, '');
  } else {
    text = extractPattern(text, NAME_EXPRESSION, 'name', current);
  }

  text = extractPattern(text, TYPE_EXPRESSION, 'type', current);
  text = extractPattern(text, DEFAULT_EXPRESSION, 'default', current);

  // Assign the remaining text as description after removing any leading hyphen
  current.desc = text.replace(LEADING_HYPHEN, '').trim() || undefined;

  // Recursively parse nested options if a list exists
  const optionsNode = child.children.find(node => node.type === 'list');
  if (optionsNode) {
    current.options = optionsNode.children.map(parseListItem);
  }

  return current;
}

/**
 * Parses a list of nodes and updates the section accordingly.
 * @param {import('../types').Section} section - The section to update.
 * @param {Array} nodes - The AST nodes.
 */
export function parseList(section, nodes) {
  const list = nodes[0]?.type === 'list' ? nodes.shift() : null;

  const values = list ? list.children.map(parseListItem) : [];

  // Handle different section types based on parsed values
  switch (section.type) {
    case 'ctor':
    case 'classMethod':
    case 'method':
      section.signatures = [parseSignature(section.textRaw, values)];
      break;
    case 'property':
      if (values.length) {
        const { type, ...rest } = values[0];
        section.type = type;
        Object.assign(section, rest);
        section.textRaw = `\`${section.name}\` ${section.textRaw}`;
      }
      break;
    case 'event':
      section.params = values;
      break;
    default:
      // Re-add list for further processing if not handled
      if (list) {
        nodes.unshift(list);
      }
  }
}
