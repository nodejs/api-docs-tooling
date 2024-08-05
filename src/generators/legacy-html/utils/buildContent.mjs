'use strict';

import { h as createElement } from 'hastscript';
import { u as createTree } from 'unist-builder';

import buildExtraContent from './buildExtraContent.mjs';

import { DOC_NODE_BLOB_BASE_URL } from '../../../constants.mjs';

/**
 * Builds a Markdown heading for a given node
 *
 * @param {ApiDocMetadataEntry} node The node to build the Markdown heading for
 * @param {import('unified').Processor} remark The Remark instance to be used to process
 * @returns {import('unist').Parent} The HTML AST tree of the heading content
 */
const buildHeadingElement = (node, remark) => {
  const [, headingId] = node.slug.split('#');

  // Creates the element that references the link to the heading
  const headingLinkElement = createElement(
    'span',
    createElement('a.mark#headingId', { href: `#${headingId}` }, '#')
  );

  // Creates the heading element with the heading text and the link to the heading
  return createElement(`h${node.heading.data.depth + 1}`, [
    ...remark.runSync(node.heading).children,
    headingLinkElement,
  ]);
};

/**
 * Builds a Markdown Stability Index
 *
 * @param {ApiDocMetadataEntry} node The node to build the Markdown Stability Index for
 * @param {import('unified').Processor} remark The Remark instance to be used to process
 * @returns {import('unist').Parent} The AST tree of the Stability Index content
 */
const buildStabilityIndexes = (node, remark) => {
  // Iterates over each stability index to create a `div` element with the stability index class
  const parsedStabilityIndexes = node.stability.children.map(stabilityNode =>
    createElement(
      // Creates the `div` element with the class `api_stability` and the stability index class
      `div.api_stability.api_stability_${stabilityNode.data.index}`,
      // Processed the Markdown nodes into HTML nodes
      remark.runSync(stabilityNode).children
    )
  );

  // Creates a tree to surround the Stability Indexes
  return createTree('root', parsedStabilityIndexes);
};

/**
 * Builds the Metadata Properties into content
 *
 * @param {ApiDocMetadataEntry} node The node to build to build the properties from
 * @returns {import('unist').Parent} The HTML AST tree of the properties content
 */
const buildMetadataElement = node => {
  const metadataElement = createElement('div.api_metadata');

  // We use a `span` element to display the source link as a clickable link to the source within Node.js
  if (node.sourceLink && node.sourceLink.length) {
    // Creates the source link URL with the base URL and the source link
    const sourceLink = `${DOC_NODE_BLOB_BASE_URL}${node.sourceLink}`;

    // Creates the source link element with the source link and the source link text
    const sourceLinkElement = createElement('span', [
      createElement('b', 'Source Code: '),
      createElement('a', { href: sourceLink }, node.sourceLink),
    ]);

    // Appends the source link element to the metadata element
    metadataElement.children.push(sourceLinkElement);
  }

  // If there are changes, we create a `details` element with a `table` element to display the changes
  // Differently from the old API docs, on this version we always enforce a table to display the changes
  if (node.changes && node.changes.length) {
    // Maps the changes into a `tr` element with the version and the description
    const mappedHistoryEntries = node.changes.map(({ version, description }) =>
      createElement('tr', [
        createElement('td', version.join(', ')),
        createElement('td', description),
      ])
    );

    // Creates the history details element with a summary and a table with the changes
    const historyDetailsElement = createElement('details.changelog', [
      createElement('summary', 'History'),
      createElement('table', [
        createElement('thead', [
          createElement('tr', [
            createElement('th', 'Version'),
            createElement('th', 'Changes'),
          ]),
        ]),
        createElement('tbody', mappedHistoryEntries),
      ]),
    ]);

    // Appends the history details element to the metadata element
    metadataElement.children.push(historyDetailsElement);
  }

  // Parses and processes the mixed Markdonw/HTML content into an HTML AST tree
  return metadataElement;
};

/**
 * Builds the whole content of a given node (API module)
 *
 * @param {Array<ApiDocMetadataEntry>} headNodes The API metadata Nodes that are considered the "head" of each module
 * @param {Array<ApiDocMetadataEntry>} nodes The API metadata Nodes to be transformed into HTML content
 * @param {import('unified').Processor} remark The Remark instance to be used to process
 */
export default (headNodes, nodes, remark) => {
  // Builds extra content based on the node tags
  const extraContent = buildExtraContent(headNodes, nodes);

  // Creates the root node for the content
  const parsedNodes = createTree(
    'root',
    // Parses the metadata pieces of each node and the content
    nodes.map((node, index) => {
      const headingElement = buildHeadingElement(node, remark);
      const metadataElement = buildMetadataElement(node);
      const stabilityIndexes = buildStabilityIndexes(node, remark);

      // Processes the Markdown AST tree into an HTML AST tree
      const processedContent = remark.runSync(node.content);

      const extraContentForNode = extraContent.children[index];

      // Concatenates all the strings and parses with remark into an AST tree
      return createElement('section', [
        headingElement,
        metadataElement,
        ...extraContentForNode,
        ...stabilityIndexes.children,
        ...processedContent.children,
      ]);
    })
  );

  // Stringifies the processed nodes to return the final Markdown content
  return remark.stringify(parsedNodes);
};
