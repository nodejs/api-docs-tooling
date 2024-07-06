'use strict';

import * as parserUtils from './utils/parser.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 *
 * @param {import('./types.d.ts').ApiDocMetadata} fileMetadata The current top-level API metadata
 */
const createQueries = fileMetadata => {
  /**
   * Transforms plain reference to Web/JavaScript/Node.js types
   * into Markdown links containing the proper reference to said types
   *
   * @param {string} source The type source
   */
  const getReferenceLink = source =>
    parserUtils.transformTypeToReferenceLink(fileMetadata, source);

  /**
   * Retrieves the Heading Type of a Sub Heading
   *
   * @param {string} heading The Heading Inner Content
   * @param {number} depth The Heading Depth
   */
  const getHeadingType = (heading, depth) => {
    if (depth === 1) {
      return 'module';
    }

    if (depth >= 2 && depth <= 4) {
      if (heading.startsWith('Class:')) {
        return 'class';
      }

      if (heading.startsWith('Event:')) {
        return 'event';
      }

      if (heading.startsWith('Static method:')) {
        return 'classMethod';
      }

      return heading.includes('(') ? 'method' : 'property';
    }
  };

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

  return { getReferenceLink, getHeadingType, parseYAML };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownFootUrls: /^(?![+a-z]+:)([^#?]+)\.md(#.+)?$/i,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{|<)(?! )[a-z0-9.| \n\[\]\\]+(?! )(\}|>)/gim,
  // ReGeX for replacing the Stability Index with a MDX Component
  // @TODO: Only used for the MDX Generator
  stabilityIndex: /^> (.*:)\s*(\d)([\s\S]*)/,
  // ReGeX for retrieving the inner content from a YAML block
  yamlInnerContent: /^<!--(YAML| YAML)?([\s\S]*?)-->/,
};

createQueries.TESTS = {
  isYamlNode: ({ type, value }) =>
    type === 'html' && createQueries.QUERIES.yamlInnerContent.test(value),
  isTextWithType: ({ type, value }) =>
    type === 'text' && createQueries.QUERIES.normalizeTypes.test(value),
  isMarkdownFootUrl: ({ type, value }) =>
    type === 'link' && createQueries.QUERIES.markdownFootUrls.test(value),
  isHeadingNode: ({ type, depth }) =>
    type === 'heading' && depth >= 1 && depth <= 6,
};

export default createQueries;
