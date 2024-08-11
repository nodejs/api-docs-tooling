'use strict';

import { DOC_API_STABILITY_SECTION_REF_URL } from './constants.mjs';

import * as parserUtils from './utils/parser.mjs';
import { transformNodesToString } from './utils/unist.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 */
const createQueries = () => {
  /**
   * Sanitizes the YAML source by returning the inner YAML content
   * and then parsing it into an API Metadata object and updating the current Metadata
   *
   * @param {import('unist').Node} node The YAML Node
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addYAMLMetadata = (node, apiEntryMetadata) => {
    const sanitizedString = node.value.replace(
      createQueries.QUERIES.yamlInnerContent,
      (_, __, inner) => inner
    );

    apiEntryMetadata.updateProperties(
      parserUtils.parseYAMLIntoMetadata(sanitizedString)
    );
  };

  /**
   * Parse a Heading Node into Metadata and updates the current Metadata
   *
   * @param {import('unist').Node} node The Heading Node
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addHeadingMetadata = (node, apiEntryMetadata) => {
    const heading = transformNodesToString(node.children);

    // Append the heading metadata to the node's `data` property
    node.data = parserUtils.parseHeadingIntoMetadata(heading, node.depth);

    apiEntryMetadata.setHeading(node);
  };

  /**
   * Updates a Markdown Link into a HTML Link for API Docs
   *
   * @param {import('unist').Node} node Thead Link Node
   */
  const updateMarkdownLink = node => {
    node.url = node.url.replace(
      createQueries.QUERIES.markdownUrl,
      (_, filename, hash = '') => `${filename}.html${hash}`
    );
  };

  /**
   * Updates a Markdown Link Reference into an actual Link to the Definition
   *
   * @param {import('unist').Node} node Thead Link Reference Node
   * @param {Array<import('unist').Node>} definitions The Definitions of the API Doc
   */
  const updateLinkReference = (node, definitions) => {
    const definition = definitions.find(
      ({ identifier }) => identifier === node.identifier
    );

    node.type = 'link';
    node.url = definition.url;
  };

  /**
   * Parses a Stability Index Entry and updates the current Metadata
   *
   * @param {import('unist').Parent} node Thead Link Reference Node
   * @param {ReturnType<import('./metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addStabilityIndexMetadata = (node, apiEntryMetadata) => {
    const stabilityPrefix = transformNodesToString(
      // `node` is a `blockquote` node, and the first child will always be
      // a `paragraph` node, so we can safely access the children of the first child
      // which we use as the prefix and description of the Stability Index
      node.children[0].children
    );

    // Attempts to grab the Stability Index and Description from the prefix
    const matches = createQueries.QUERIES.stabilityIndex.exec(stabilityPrefix);

    // Ensures that the matches are valid and that we have at least 3 entries
    if (matches && matches.length >= 3) {
      // The 2nd match should be the group that matches the Stability Index
      const index = Number(matches[1]);
      // The 3rd match should be the group containing all the remaining text
      // which is used as a description (we trim it to an one liner)
      const description = matches[2].replaceAll('\n', ' ').trim();

      // Append the stability index to the node's `data` property
      node.data = { index, description };

      apiEntryMetadata.addStability(node);
    }
  };

  /**
   * Updates type links `{types}` into Markdown links referencing to the correct
   * API docs (either MDN or other sources) for the types
   *
   * @param {import('vfile').VFile} vfile The source Markdown file before any modifications
   */
  const updateTypesToMarkdownLinks = vfile => {
    // The `vfile` value is a String (check `loaders.mjs`)
    vfile.value = vfile.value.replaceAll(
      createQueries.QUERIES.normalizeTypes,
      parserUtils.transformTypeToReferenceLink
    );
  };

  /**
   * Updates the Stability Index Prefixes to be Markdown Links
   * to the API documentation
   *
   * @param {import('vfile').VFile} vfile The source Markdown file before any modifications
   */
  const updateStailityPrefixToMarkdownLinks = vfile => {
    // The `vfile` value is a String (check `loaders.mjs`)
    vfile.value = vfile.value.replaceAll(
      createQueries.QUERIES.stabilityIndexPrefix,
      match => `[${match}](${DOC_API_STABILITY_SECTION_REF_URL})`
    );
  };

  return {
    addYAMLMetadata,
    addHeadingMetadata,
    updateMarkdownLink,
    updateLinkReference,
    addStabilityIndexMetadata,
    updateTypesToMarkdownLinks,
    updateStailityPrefixToMarkdownLinks,
  };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownUrl: /^(?![+a-z]+:)([^#?]+)\.md(#.+)?$/i,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{)(?! )[a-z0-9.| \[\]\\]+(?! )(\})/gim,
  // ReGeX for handling Stability Indexes Metadata
  stabilityIndex: /^Stability: ([0-5])(?:\s*-\s*)?(.*)$/s,
  // ReGeX for handling the Stability Index Prefix
  stabilityIndexPrefix: /Stability: ([0-5])/gi,
  // ReGeX for retrieving the inner content from a YAML block
  yamlInnerContent: /^<!--(YAML| YAML)?([\s\S]*?)-->/,
};

createQueries.UNIST = {
  isStabilityIndex: ({ type, children }) =>
    type === 'blockquote' &&
    createQueries.QUERIES.stabilityIndex.test(transformNodesToString(children)),
  isYamlNode: ({ type, value }) =>
    type === 'html' && createQueries.QUERIES.yamlInnerContent.test(value),
  isTextWithType: ({ type, value }) =>
    type === 'text' && createQueries.QUERIES.normalizeTypes.test(value),
  isMarkdownUrl: ({ type, url }) =>
    type === 'link' && createQueries.QUERIES.markdownUrl.test(url),
  isHeading: ({ type, depth }) =>
    type === 'heading' && depth >= 1 && depth <= 4,
  isLinkReference: ({ type, identifier }) =>
    type === 'linkReference' && !!identifier,
};

export default createQueries;
