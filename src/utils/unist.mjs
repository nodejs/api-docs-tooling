'use strict';

/**
 * This utility allows us to join children Nodes into one
 * and do extra parsing within them
 *
 * @param {import('unist').Node} nodes Nodes to parsed and joined
 * @param {import('vfile').VFile} source The source VFile
 * @returns {string} The parsed and joined nodes as a string
 */
export const transformNodesToRaw = (nodes, source) => {
  const mappedChildren = nodes.map(node => {
    if (node.type === 'inlineCode') {
      return `\`${node.value}\``;
    }

    if (node.type === 'strong') {
      return `**${transformNodesToRaw(node.children, source)}**`;
    }

    if (node.type === 'emphasis') {
      return `_${transformNodesToRaw(node.children, source)}_`;
    }

    if (node.children) {
      return transformNodesToRaw(node.children, source);
    }

    return node.value;
  });

  return mappedChildren.join('');
};
