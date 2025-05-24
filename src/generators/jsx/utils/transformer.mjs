import { visit } from 'unist-util-visit';
import { TAG_TRANSFORMS } from '../constants.mjs';

/**
 * Transforms elements in a syntax tree by replacing tag names according to the mapping.
 *
 * @param {Object} tree - The abstract syntax tree to transform
 * @returns {Object} The transformed tree (modified in place)
 */
export default () => tree => {
  visit(tree, ['raw', 'element'], node => {
    // TODO(@avivkeller): Our parsers shouldn't return raw nodes
    // When they mistake "<Type>" for an HTML node, rather than
    // the string type that it is.
    if (node.type === 'raw') {
      node.type = 'text';
    } else {
      const replacement = TAG_TRANSFORMS[node.tagName];
      if (replacement) {
        node.tagName = replacement;
      }
    }
  });
};
