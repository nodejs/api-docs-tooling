/**
 * Imports the visit utility from unist-util-visit for traversing syntax trees.
 */
import { visit } from 'unist-util-visit';
import { TAG_TRANSFORMS } from '../constants.mjs';

/**
 * Transforms elements in a syntax tree by replacing tag names according to a mapping.
 * Traverses the tree and replaces any element's tagName if it exists as a key in the tagMap.
 *
 * @param {Object} tree - The abstract syntax tree to transform
 * @returns {Object} The transformed tree (modified in place)
 * @throws {ReferenceError} Will throw if 'tagMap' is not defined in scope
 */
export default () => tree => {
  // TODO(@avivkeller): Nodes like "Array<string>" return a "<string>" raw type,
  //                    which Recma does not understand, so we make them text.

  visit(tree, 'raw', node => {
    node.type = 'text';
  });

  visit(tree, 'element', node => {
    const replacement = TAG_TRANSFORMS[node.tagName];
    if (replacement) {
      node.tagName = replacement;
    }
  });
};
