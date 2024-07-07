'use strict';

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
   * @param {ReturnType<ReturnType<import('./metadata.mjs').default>['newMetadataEntry']>} apiEntryMetadata The API entry Metadata
   */
  const addYAMLMetadata = (node, apiEntryMetadata) => {
    const sanitizedString = node.value.replace(
      createQueries.QUERIES.yamlInnerContent,
      (_, __, inner) => inner
    );

    const metadata = parserUtils.parseYAMLIntoMetadata(sanitizedString);

    apiEntryMetadata.updateProperties(metadata);
  };

  /**
   * Transforms plain reference to Web/JavaScript/Node.js types
   * into Markdown links containing the proper reference to said types
   *
   * @param {import('unist').Node} node The Type Node
   */
  const updateTypeToReferenceLink = node => {
    const parsedReference = node.value.replace(
      createQueries.QUERIES.normalizeTypes,
      parserUtils.transformTypeToReferenceLink
    );

    node.type = 'html';
    node.value = parsedReference;
  };

  /**
   * Parse a Heading Node into Metadata and updates the current Metadata
   *
   * @param {import('unist').Node} node The Heading Node
   * @param {ReturnType<ReturnType<import('./metadata.mjs').default>['newMetadataEntry']>} apiEntryMetadata The API entry Metadata
   */
  const addHeadingMetadata = (node, apiEntryMetadata) => {
    const heading = transformNodesToString(node.children);

    const parsedHeading = parserUtils.parseHeadingIntoMetadata(
      heading,
      node.depth
    );

    apiEntryMetadata.setHeading(parsedHeading);
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
   * @param {import('unist').Node} node Thead Link Reference Node
   * @param {ReturnType<ReturnType<import('./metadata.mjs').default>['newMetadataEntry']>} apiEntryMetadata The API entry Metadata
   */
  const addStabilityIndexMetadata = (node, apiEntryMetadata) => {
    const stabilityIndexString = transformNodesToString(
      node.children[0].children
    );

    const stabilityIndex =
      createQueries.QUERIES.stabilityIndex.exec(stabilityIndexString);

    apiEntryMetadata.updateProperties({
      stability_index: {
        index: Number(stabilityIndex[1]),
        description: stabilityIndex[2].replaceAll('\n', ' ').trim(),
      },
    });
  };

  return {
    addYAMLMetadata,
    updateTypeToReferenceLink,
    addHeadingMetadata,
    updateMarkdownLink,
    updateLinkReference,
    addStabilityIndexMetadata,
  };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownUrl: /^(?![+a-z]+:)([^#?]+)\.md(#.+)?$/i,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{|<)(?! )[a-z0-9.| \n\[\]\\]+(?! )(\}|>)/gim,
  // ReGeX for handling Stability Indexes Metadata
  stabilityIndex: /^Stability: ([0-5])(?:\s*-\s*)?(.*)$/s,
  // ReGeX for retrieving the inner content from a YAML block
  yamlInnerContent: /^<!--(YAML| YAML)?([\s\S]*?)-->/,
};

createQueries.UNIST_TESTS = {
  isStabilityIndex: ({ type, children }) =>
    type === 'blockquote' &&
    createQueries.QUERIES.stabilityIndex.test(transformNodesToString(children)),
  isYamlNode: ({ type, value }) =>
    type === 'html' && createQueries.QUERIES.yamlInnerContent.test(value),
  isTextWithType: ({ type, value }) =>
    type === 'text' && createQueries.QUERIES.normalizeTypes.test(value),
  isMarkdownUrl: ({ type, url }) =>
    type === 'link' && createQueries.QUERIES.markdownUrl.test(url),
  isHeadingNode: ({ type, depth }) =>
    type === 'heading' && depth >= 1 && depth <= 4,
  isLinkReference: ({ type, identifier }) =>
    type === 'linkReference' && !!identifier,
};

export default createQueries;
