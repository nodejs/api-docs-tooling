import { highlightToHast } from '@node-core/rehype-shiki';
import { h as createElement } from 'hastscript';

import createQueries from '../../../utils/queries/index.mjs';
import { parseListItem } from '../../legacy-json/utils/parseList.mjs';
import parseSignature from '../../legacy-json/utils/parseSignature.mjs';

/**
 * Checks if a node represents a possible type or type connector
 * @param {Object} node - The node to check
 * @returns {number} - 2 if node is a type connector, 1 if node is a type reference, 0 otherwise
 */
const checkPossibleType = node =>
  node.type === 'text' && node.value === ' | '
    ? 2
    : node.type === 'link' &&
        node.children?.[0]?.type === 'inlineCode' &&
        node.children[0].value?.startsWith('<')
      ? 1
      : 0;

/**
 * Gets a list of properties from a typed list
 * @param {import('mdast').List} node
 */
export const parseListIntoProperties = node => {
  const properties = [];

  for (const item of node.children) {
    let name;
    let types = [];

    const [{ children }, ...otherChildren] = item.children;

    if (children[0].type === 'inlineCode') {
      name = children.shift().value.trimEnd();
    } else if (children[0].value && children[0].value.startsWith('Returns')) {
      name = 'Returns';
      children[0].value = children[0].value.replace(/^Returns:?\s*/i, '');
      if (!children[0].value.trim()) {
        children.shift();
      }
    }

    if (children[0]?.value?.trim() === '') {
      // Remove any leading space
      children.shift();
    }

    while (children.length > 0) {
      const typeLikeResult = checkPossibleType(children[0]);

      if (typeLikeResult === 0) {
        break;
      }

      types.push(children.shift());

      if (typeLikeResult === 2) {
        types.push(children.shift());
      }
    }

    if (children[0]?.type === 'text') {
      children[0].value = children[0].value.trimStart();
    }

    properties.push({
      name,
      types,
      desc: children,
      sublist: otherChildren.find(createQueries.UNIST.isTypedList),
    });
  }

  return properties;
};

/**
 * Creates a property table
 * @param {import('mdast').List} node
 * @param {boolean} withHeading
 * @returns {import('hast').Element}
 */
export const createPropertyTable = (node, withHeading = true) => {
  const properties = parseListIntoProperties(node);

  // Create table rows
  const rows = properties.flatMap(prop => {
    const cells = [];

    if (prop.name?.startsWith('Returns')) {
      cells.push(createElement('td', 'Returns'));
    } else {
      cells.push(
        createElement('td', prop.name ? createElement('code', prop.name) : '-')
      );
    }

    cells.push(createElement('td', prop.types.length > 0 ? prop.types : '-'));
    cells.push(createElement('td', prop.desc.length > 0 ? prop.desc : '-'));

    return prop.sublist
      ? [
          createElement('tr', cells),
          createElement(
            'tr',
            createElement(
              'td',
              { colspan: cells.length },
              createPropertyTable(prop.sublist, false)
            )
          ),
        ]
      : createElement('tr', cells);
  });

  if (withHeading) {
    return createElement('table', [
      createElement('thead', [
        createElement('tr', [
          createElement('th', 'Property'),
          createElement('th', 'Type'),
          createElement('th', 'Description'),
        ]),
      ]),
      createElement('tbody', rows),
    ]);
  }

  return createElement('table', rows);
};

/**
 * Generates the function signature based on optional parameters
 * @param {string} functionName - Name of the function
 * @param {import('../../legacy-json/types.d.ts').MethodSignature} signature - Signature object
 * @param {string} prefix - `'new '` or `''`
 */
export const generateSignature = (
  functionName,
  { params, return: returnType },
  prefix = ''
) => {
  const returnStr = returnType ? `: ${returnType.type}` : '';
  const paramsStr = params
    .map(param => {
      let paramStr = param.name;
      if (param.optional || param.default) {
        paramStr += '?';
      }
      return paramStr;
    })
    .join(', ');

  return `${prefix}${functionName}(${paramsStr})${returnStr}`;
};

/**
 * Creates a code block with function signatures
 * @param {string} functionName - Name of the function
 * @param {import('../../legacy-json/types.d.ts').MethodSignature} signature - Signature object
 * @param {string} prefix - `'new '` or `''`
 */
export const createSignatureCodeBlock = (functionName, signature, prefix) => {
  const sig = generateSignature(functionName, signature, prefix);
  const highlighted = highlightToHast(sig, 'typescript');
  return createElement('div', { class: 'signature' }, [highlighted]);
};

/**
 * Gets the full name of a function.
 * @param {HeadingMetadataEntry} heading
 * @param {any} fallback
 */
export const getFullName = ({ name, text }, fallback = name) => {
  // Exit early if the name wasn't processed
  if (name === text) {
    return fallback;
  }

  const code = text.trim().match(/`([^`]+)`/)?.[1];
  return code?.includes(name)
    ? code
        .slice(0, code.indexOf(name) + name.length)
        .replace(/^["']|new\s*/, '')
    : fallback;
};

/**
 * Creates documentation from API metadata entries
 * @param {import('@types/mdast').Parent} parent - The parent node
 * @param {import('@types/mdast').Heading} heading - The heading
 * @param {number} idx - Index
 */
export default ({ children }, { data }, idx) => {
  // Find the list in the parent
  const list = children.find(createQueries.UNIST.isTypedList);

  const params = list ? list.children.map(parseListItem) : [];

  const signature = parseSignature(data.text, params);
  const displayName = getFullName(data);

  children.splice(
    idx,
    0,
    createSignatureCodeBlock(
      displayName,
      signature,
      data.type === 'ctor' ? 'new ' : ''
    )
  );
};
