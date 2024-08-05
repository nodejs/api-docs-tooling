'use strict';

/**
 * Generates the Table of Contents (ToC) based on the API metadata nodes.
 * it uses the `node.heading.depth` property to determine the depth of the ToC,
 * the `node.heading.text` property to get the label/text of the ToC entry, and
 * the `node.slug` property to generate the link to the section.
 *
 * This generates a Markdown string containing a list as the ToC for the API documentation.
 *
 * @param {Array<ApiDocMetadataEntry>} nodes The API metadata nodes to be used for the ToC
 * @param {{ maxDepth: number; parser: (node: ApiDocMetadataEntry) => string }} options The optional ToC options
 */
const tableOfContents = (nodes, options) => {
  return nodes.reduce((acc, node) => {
    // Check if the depth of the heading is less than or equal to the maximum depth
    if (node.heading.data.depth <= options.maxDepth) {
      // Generate the indentation based on the depth of the heading
      const indent = '  '.repeat(node.heading.data.depth - 1);

      // Append the ToC entry to the accumulator
      acc += `${indent}- ${options.parser(node)}\n`;
    }

    return acc;
  }, '');
};

/**
 * Builds the Label with extra metadata to be used in the ToC
 *
 * @param {ApiDocMetadataEntry} node The current node that is being parsed
 */
tableOfContents.parseNavigationNode = node =>
  `<a class="nav-${node.api}" href="${node.api}.html">${node.heading.data.name}</a>`;

/**
 * Builds the Label with extra metadata to be used in the ToC
 *
 * @param {ApiDocMetadataEntry} node
 */
tableOfContents.parseToCNode = node => {
  // If the node has a stability index, add the stability index to the ToC entry
  if (node.stability.children.length === 1) {
    const firstStability = node.stability.children[0];

    return (
      `<span class="stability_${firstStability.data.index}">` +
      `<a href="${node.slug}">${node.heading.data.text}</a></span>`
    );
  }

  // Otherwise, just the plain text of the heading with a link
  return `<a href="${node.slug}">${node.heading.data.text}</a>`;
};

export default tableOfContents;
