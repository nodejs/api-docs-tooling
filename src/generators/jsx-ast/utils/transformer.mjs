import { visit } from 'unist-util-visit';
import { TYPE_TRANSFORMS, TAG_TRANSFORMS } from '../constants.mjs';

/**
 * @template {import('unist').Node} T
 * @param {T} tree
 * @returns {T}
 */
const transformer = tree => {
  visit(tree, ['raw', 'element'], node => {
    // TODO(@avivkeller): Our parsers shouldn't return raw nodes
    // when they mistake "<Type>" for an HTML node, rather, they
    // should return the string type that it is.
    node.type =
      node.type in TYPE_TRANSFORMS ? TYPE_TRANSFORMS[node.type] : node.type;
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
