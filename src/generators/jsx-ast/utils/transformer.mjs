import { visit } from 'unist-util-visit';

import { TAG_TRANSFORMS } from '../constants.mjs';

/**
 * @template {import('unist').Node} T
 * @param {T} tree
 * @returns {T}
 */
const transformer = tree => {
  visit(tree, 'element', node => {
    node.tagName =
      node.tagName in TAG_TRANSFORMS
        ? TAG_TRANSFORMS[node.tagName]
        : node.tagName;
  });
};

/**
 * Transforms elements in a syntax tree by replacing tag names according to the mapping.
 */
export default () => transformer;
