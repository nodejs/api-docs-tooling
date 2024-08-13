'use strict';

import { u as createTree } from 'unist-builder';
import { SKIP } from 'unist-util-visit';

import { DOC_API_STABILITY_SECTION_REF_URL } from './constants.mjs';

import { transformNodesToString } from './utils/unist.mjs';

import {
  parseHeadingIntoMetadata,
  parseYAMLIntoMetadata,
  transformTypeToReferenceLink,
} from './utils/parser.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 */
const createQueries = () => {
  /**
   * Sanitizes the YAML source by returning the inner YAML content
   * and then parsing it into an API Metadata object and updating the current Metadata
   *
   * @param {import('mdast').Html} node A HTML node containing the YAML content
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addYAMLMetadata = (node, apiEntryMetadata) => {
    const sanitizedString = node.value.replace(
      createQueries.QUERIES.yamlInnerContent,
      (_, __, inner) => inner
    );

    apiEntryMetadata.updateProperties(parseYAMLIntoMetadata(sanitizedString));

    return [SKIP];
  };

  /**
   * Parse a Heading node into metadata and updates the current metadata
   *
   * @param {import('mdast').Heading} node A Markdown heading node
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const setHeadingMetadata = (node, apiEntryMetadata) => {
    const stringifiedHeading = transformNodesToString(node.children);

    // Append the heading metadata to the node's `data` property
    node.data = parseHeadingIntoMetadata(stringifiedHeading, node.depth);

    apiEntryMetadata.setHeading(node);
  };

  /**
   * Updates a Markdown link into a HTML link for API docs
   *
   * @param {import('mdast').Link} node A Markdown link node
   */
  const updateMarkdownLink = node => {
    node.url = node.url.replace(
      createQueries.QUERIES.markdownUrl,
      (_, filename, hash = '') => `${filename}.html${hash}`
    );

    return [SKIP];
  };

  /**
   * Updates a Markdown text containing an API type reference
   * into a Markdown link referencing to the correct API docs
   *
   * @param {import('mdast').Text} node A Markdown link node
   */
  const updateTypeReference = node => {
    const replacedTypes = node.value.replace(
      createQueries.QUERIES.normalizeTypes,
      transformTypeToReferenceLink
    );

    node.type = 'html';
    node.value = replacedTypes;

    return [SKIP];
  };

  /**
   * Updates a Markdown Link Reference into an actual Link to the Definition
   *
   * @param {import('mdast').LinkReference} node A link reference node
   * @param {Array<import('mdast').Definition>} definitions The Definitions of the API Doc
   */
  const updateLinkReference = (node, definitions) => {
    const definition = definitions.find(
      ({ identifier }) => identifier === node.identifier
    );

    node.type = 'link';
    node.url = definition.url;

    return [SKIP];
  };

  /**
   * Parses a Stability Index Entry and updates the current Metadata
   *
   * @param {import('mdast').Blockquote} node Thead Link Reference Node
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addStabilityMetadata = (node, apiEntryMetadata) => {
    // `node` is a `blockquote` node, and the first child will always be
    // a `paragraph` node, so we can safely access the children of the first child
    // which we use as the prefix and description of the Stability Index
    const stabilityPrefix = transformNodesToString(node.children[0].children);

    // Attempts to grab the Stability index and description from the prefix
    const matches = createQueries.QUERIES.stabilityIndex.exec(stabilityPrefix);

    // Ensures that the matches are valid and that we have at least 3 entries
    if (matches && matches.length === 3) {
      // Updates the `data` property of the Stability Index node
      // so that the original node data can also be inferred
      node.data = {
        // The 2nd match should be the group that matches the Stability Index
        index: Number(matches[1]),
        // The 3rd match should be the group containing all the remaining text
        // which is used as a description (we trim it to an one liner)
        description: matches[2].replace(/\n/g, ' ').trim(),
      };

      // Creates a new Tree node containing the Stability Index metadata
      const stabilityIndexNode = createTree(
        'root',
        { data: node.data },
        node.children
      );

      // Adds the Stability Index metadata to the current Metadata entry
      apiEntryMetadata.addStability(stabilityIndexNode);
    }

    return [SKIP];
  };

  /**
   * Updates the Stability Index Prefixes to be Markdown Links
   * to the API documentation
   *
   * @param {import('vfile').VFile} vfile The source Markdown file before any modifications
   */
  const updateStabilityPrefixToLink = vfile => {
    // The `vfile` value is a String (check `loaders.mjs`)
    vfile.value = String(vfile.value).replace(
      createQueries.QUERIES.stabilityIndexPrefix,
      match => `[${match}](${DOC_API_STABILITY_SECTION_REF_URL})`
    );
  };

  return {
    addYAMLMetadata,
    setHeadingMetadata,
    updateMarkdownLink,
    updateTypeReference,
    updateLinkReference,
    addStabilityMetadata,
    updateStabilityPrefixToLink,
  };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownUrl: /^(?![+a-zA-Z]+:)([^#?]+)\.md(#.+)?$/,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{|<)(?! )[a-zA-Z0-9.| \[\]\\]+(?! )(\}|>)/g,
  // ReGeX for handling Stability Indexes Metadata
  stabilityIndex: /^Stability: ([0-5])(?:\s*-\s*)?(.*)$/s,
  // ReGeX for handling the Stability Index Prefix
  stabilityIndexPrefix: /Stability: ([0-5])/,
  // ReGeX for retrieving the inner content from a YAML block
  yamlInnerContent: /^<!--(YAML| YAML)?([\s\S]*?)-->/,
};

createQueries.UNIST = {
  isStabilityNode: ({ type, children }) =>
    type === 'blockquote' &&
    createQueries.QUERIES.stabilityIndex.test(transformNodesToString(children)),
  isYamlNode: ({ type, value }) =>
    type === 'html' && createQueries.QUERIES.yamlInnerContent.test(value),
  isTextWithType: ({ type, value }) =>
    type === 'text' && createQueries.QUERIES.normalizeTypes.test(value),
  isMarkdownUrl: ({ type, url }) =>
    type === 'link' && createQueries.QUERIES.markdownUrl.test(url),
  isHeading: ({ type, depth }) =>
    type === 'heading' && depth >= 1 && depth <= 5,
  isLinkReference: ({ type, identifier }) =>
    type === 'linkReference' && !!identifier,
};

export default createQueries;
