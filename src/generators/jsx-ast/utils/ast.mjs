'use strict';

import { valueToEstree } from 'estree-util-value-to-estree';
import { u as createTree } from 'unist-builder';

import { AST_NODE_TYPES } from '../constants.mjs';

/**
 * @typedef {Object} JSXOptions
 * @property {boolean} [inline] - Whether the element is inline
 * @property {(string | Array<import('unist').Node>)} [children] - Child content or nodes
 */

/**
 * Creates an MDX JSX element with support for complex attribute values.
 *
 * @param {string} name - The name of the JSX element
 * @param {JSXOptions & Record<string, any>} [options={}] - Options including type, children, and JSX attributes
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
    ? AST_NODE_TYPES.MDX.JSX_INLINE_ELEMENT
    : AST_NODE_TYPES.MDX.JSX_BLOCK_ELEMENT;

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
    return createTree(AST_NODE_TYPES.MDX.JSX_ATTRIBUTE, {
      name,
      value: createTree(AST_NODE_TYPES.MDX.JSX_ATTRIBUTE_EXPRESSION, {
        data: {
          estree: {
            type: AST_NODE_TYPES.ESTREE.PROGRAM,
            body: [
              {
                type: AST_NODE_TYPES.ESTREE.EXPRESSION_STATEMENT,
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
  return createTree(AST_NODE_TYPES.MDX.JSX_ATTRIBUTE, {
    name,
    value: value == null ? value : String(value),
  });
}
