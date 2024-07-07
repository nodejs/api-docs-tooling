'use strict';

/**
 * This utility allows us to join children Nodes into one
 * and transfor them back to what their source would look like
 *
 * @param {import('unist').Node} nodes Nodes to parsed and joined
 * @returns {string} The parsed and joined nodes as a string
 */
export const transformNodesToString = nodes => {
  const mappedChildren = nodes.map(node => {
    if (node.type === 'inlineCode') {
      return `\`${node.value}\``;
    }

    if (node.type === 'strong') {
      return `**${transformNodesToString(node.children)}**`;
    }

    if (node.type === 'emphasis') {
      return `_${transformNodesToString(node.children)}_`;
    }

    if (node.children) {
      return transformNodesToString(node.children);
    }

    return node.value;
  });

  return mappedChildren.join('');
};
