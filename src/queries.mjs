'use strict';

import * as parserUtils from './utils/parser.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 */
const createQueries = () => {
  /**
   * Transforms plain reference to Web/JavaScript/Node.js types
   * into Markdown links containing the proper reference to said types
   *
   * @param {string} source The type source
   */
  const getReferenceLink = source =>
    parserUtils.transformTypeToReferenceLink(source);

  /**
   * Sanitizes the YAML source by returning the inner YAML content
   * and then parsing it into an API Metadata object
   *
   * @param {string} yamlString The YAML Code Block
   */
  const parseYAML = yamlString => {
    const sanitizedString = yamlString.replace(
      createQueries.QUERIES.yamlInnerContent,
      (_, __, inner) => inner
    );

    return parserUtils.parseYAMLIntoMetadata(sanitizedString);
  };

  return { getReferenceLink, parseYAML };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownUrl: /^(?![+a-z]+:)([^#?]+)\.md(#.+)?$/i,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{|<)(?! )[a-z0-9.| \n\[\]\\]+(?! )(\}|>)/gim,
  // ReGeX for replacing the Stability Index with a MDX Component
  // @TODO: Only used for the MDX Generator
  stabilityIndex: /^> (.*:)\s*(\d)([\s\S]*)/,
  // ReGeX for retrieving the inner content from a YAML block
  yamlInnerContent: /^<!--(YAML| YAML)?([\s\S]*?)-->/,
};

createQueries.UNIST_TESTS = {
  isYamlNode: ({ type, value }) =>
    type === 'html' && createQueries.QUERIES.yamlInnerContent.test(value),
  isTextWithType: ({ type, value }) =>
    type === 'text' && createQueries.QUERIES.normalizeTypes.test(value),
  isMarkdownUrl: ({ type, url }) =>
    type === 'link' && createQueries.QUERIES.markdownUrl.test(url),
  isHeadingNode: ({ type, depth }) =>
    type === 'heading' && depth >= 1 && depth <= 6,
  isLinkReference: ({ type, identifier }) =>
    type === 'linkReference' && !!identifier,
};

export default createQueries;
