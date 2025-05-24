'use strict';

import { u as createTree } from 'unist-builder';
import { valueToEstree } from 'estree-util-value-to-estree';

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
  // Process children: convert string to text node or use array as is
  const processedChildren =
    typeof children === 'string'
      ? [createTree('text', { value: children })]
      : (children ?? []);

  // Create attribute nodes, handling complex objects and primitive values differently
  const attrs = Object.entries(attributes).map(([key, value]) =>
    createAttributeNode(key, value)
  );

  // Create and return the appropriate JSX element type
  return createTree(inline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement', {
    name,
    attributes: attrs,
    children: processedChildren,
  });
};

/**
 * Creates an MDX JSX attribute node from the input.
 *
 * @param {string} name - The attribute name
 * @param {any} value - The attribute value (can be any valid JS value)
 * @returns {import('unist').Node} The MDX JSX attribute node
 */
function createAttributeNode(name, value) {
  // For objects and arrays, create expression nodes to preserve structure
  if (value !== null && typeof value === 'object') {
    return createTree('mdxJsxAttribute', {
      name,
      value: createTree('mdxJsxAttributeValueExpression', {
        data: {
          estree: {
            type: 'Program',
            body: [
              {
                type: 'ExpressionStatement',
                expression: valueToEstree(value),
              },
            ],
            sourceType: 'module',
          },
        },
      }),
    });
  }

  // For primitives, use simple string conversion
  return createTree('mdxJsxAttribute', { name, value: String(value) });
}
