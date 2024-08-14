'use strict';

/**
 * Generates the Table of Contents (ToC) based on the API metadata nodes.
 * it uses the `node.heading.depth` property to determine the depth of the ToC,
 * the `node.heading.text` property to get the label/text of the ToC entry, and
 * the `node.slug` property to generate the link to the section.
 *
 * This generates a Markdown string containing a list as the ToC for the API documentation.
 *
 * @param {Array<ApiDocMetadataEntry>} entries The API metadata nodes to be used for the ToC
 * @param {{ maxDepth: number; parser: (metadata: ApiDocMetadataEntry) => string }} options The optional ToC options
 */
const tableOfContents = (entries, options) => {
  // Filter out the entries that have a name property / or that have empty content
  const validHeadings = entries.filter(({ heading }) => heading.data.name);

  // Generate the ToC based on the API headings (sections)
  return validHeadings.reduce((acc, entry) => {
    // Check if the depth of the heading is less than or equal to the maximum depth
    if (entry.heading.data.depth <= options.maxDepth) {
      // Generate the indentation based on the depth of the heading
      const indent = '  '.repeat(entry.heading.data.depth - 1);

      // Append the ToC entry to the accumulator
      acc += `${indent}- ${options.parser(entry)}\n`;
    }

    return acc;
  }, '');
};

/**
 * Builds the Label with extra metadata to be used in the ToC
 *
 * @param {ApiDocMetadataEntry} metadata The current node that is being parsed
 */
tableOfContents.parseNavigationNode = ({ api, heading }) =>
  `<a class="nav-${api}" href="${api}.html">${heading.data.name}</a>`;

/**
 * Builds the Label with extra metadata to be used in the ToC
 *
 * @param {ApiDocMetadataEntry} metadata
 */
tableOfContents.parseToCNode = ({ stability, slug, heading }) => {
  // If the node has one stability index, we add the stability index class
  // into the ToC; Otherwise, we cannot determine which class to add
  // which is intentional, as some nodes have multiple stabilities
  if (stability.children.length === 1) {
    const [firstStability] = stability.children;

    return (
      `<span class="stability_${firstStability.data.index}">` +
      `<a href="${slug}">${heading.data.text}</a></span>`
    );
  }

  // Otherwise, just the plain text of the heading with a link
  return `<a href="${slug}">${heading.data.text}</a>`;
};

export default tableOfContents;
