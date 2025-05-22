import { find } from 'unist-util-find';
import { findBefore } from 'unist-util-find-before';

/**
 * Finds the first node that matches the condition before the first h2 heading,
 * this area is considered the top-level section of the tree
 *
 * @param {import('mdast').Node} node
 * @param {import('unist-util-find').TestFn} condition
 */
export const findTopLevelEntry = (node, condition) => {
  const h2 = find(node, { type: 'heading', depth: 2 });

  // If there isn't h2, search the entire tree
  if (!h2) {
    return find(node, condition);
  }

  return findBefore(node, h2, condition);
};
