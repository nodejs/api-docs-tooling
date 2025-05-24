'use strict';

import { u as createTree } from 'unist-builder';
import { valueToEstree } from 'estree-util-value-to-estree';
import { AST_NODES } from '../constants.mjs';

/**
 * Creates an MDX JSX element with support for complex attribute values.
 *
 * @param {string} name - The name of the JSX element
 * @param {{
 * inline?: boolean,
 * children?: string | import('unist').Node[],
 * [key: string]: any
 * }} [options={}] - Options including type, children, and JSX attributes
 * @returns {import('unist').Node} The created MDX JSX element node
 */
export const createJSXElement = (
  name,
  { inline = true, children = [], ...attributes } = {}
) => {
  // Convert string children to text node or use array directly
  const processedChildren =
    typeof children === 'string'
      ? [createTree('text', { value: children })]
      : children;

  const elementType = inline
    ? AST_NODES.MDX.JSX_INLINE_ELEMENT
    : AST_NODES.MDX.JSX_BLOCK_ELEMENT;

  const attrs = Object.entries(attributes).map(([key, value]) =>
    createAttributeNode(key, value)
  );

  return createTree(elementType, {
    name,
    attributes: attrs,
    children: processedChildren,
  });
};

/**
 * Creates an MDX JSX attribute node based on the value type.
 *
 * @param {string} name - The attribute name
 * @param {any} value - The attribute value
 * @returns {import('unist').Node} The MDX JSX attribute node
 */
function createAttributeNode(name, value) {
  // Use expression for objects and arrays
  if (value !== null && typeof value === 'object') {
    return createTree(AST_NODES.MDX.JSX_ATTRIBUTE, {
      name,
      value: createTree(AST_NODES.MDX.JSX_ATTRIBUTE_EXPRESSION, {
        data: {
          estree: {
            type: AST_NODES.ESTREE.PROGRAM,
            body: [
              {
                type: AST_NODES.ESTREE.EXPRESSION_STATEMENT,
                expression: valueToEstree(value),
              },
            ],
          },
        },
      }),
    });
  }

  // For primitives, use simple string conversion.
  // If undefined, pass nothing.
  return createTree(AST_NODES.MDX.JSX_ATTRIBUTE, {
    name,
    value: value === undefined ? value : String(value),
  });
}
