'use strict';

import { h as createElement } from 'hastscript';
import { u as createTree } from 'unist-builder';
import { SKIP, visit } from 'unist-util-visit';

import buildExtraContent from './buildExtraContent.mjs';

import createQueries from '../../../queries.mjs';

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
    // The inner Heading markdown content is still using Remark nodes, and they need
    // to be converted into Rehype nodes
    remark.runSync(node.heading),
    headingLinkElement,
  ]);
};

/**
 * Builds an HTML Stability element
 *
 * @param {import('mdast').Blockquote} node The HTML AST tree of the Stability Index content
 * @param {number} index The index of the current node
 * @param {import('unist').Parent} parent The parent node of the current node
 */
const buildStability = ({ children, data }, index, parent) => {
  const stabilityElement = createElement(
    // Creates the `div` element with the class `api_stability` and the stability index class
    // FYI: Since the Stability Index `blockquote` node gets modified within `queries.mjs`
    // it contains the StabilityIndexMetadataEntry within the `data` property
    `div.api_stability.api_stability_${data.index}`,
    // Processed the Markdown nodes into HTML nodes
    children
  );

  // Replaces the Stability Index `blockquote` node with the new Stability Index element
  parent.children.splice(index, 1, stabilityElement);

  return [SKIP];
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
  // Creates the root node for the content
  const parsedNodes = createTree(
    'root',
    // Parses the metadata pieces of each node and the content
    nodes.map(node => {
      // Depp clones the content nodes to avoid affecting upstream nodes
      const clonedContent = JSON.parse(JSON.stringify(node.content));

      // Parses the Blockquotes into Stability elements
      // This is treated differently as we want to preserve the position of a Stability Index
      // within the content, so we can't just remove it and append it to the metadata
      visit(clonedContent, createQueries.UNIST.isStabilityNode, buildStability);

      const headingElement = buildHeadingElement(node, remark);
      const metadataElement = buildMetadataElement(node);
      const extraContent = buildExtraContent(headNodes, node);

      // Processes the Markdown AST tree into an HTML AST tree
      const sectionContent = remark.runSync(clonedContent);

      // Concatenates all the strings and parses with remark into an AST tree
      return createElement('section', [
        headingElement,
        metadataElement,
        extraContent,
        sectionContent,
      ]);
    })
  );

  // Stringifies the processed nodes to return the final Markdown content
  return remark.stringify(parsedNodes);
};
