'use strict';

import * as parserUtils from './utils/parser.mjs';

import { DOC_WEB_BASE_PATH } from './constants.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 *
 * @param {ReturnType<ReturnType<import('./metadata.mjs')['default']>['newMetadataEntry']>} apiEntryMetadata The current Navigation instance
 * @param {import('./types.d.ts').ApiDocMetadata} fileMetadata The current top-level API metadata
 */
const createQueries = (apiEntryMetadata, fileMetadata) => {
  /**
   * This utility fixes URL references from `.md` files directly to the /api/ path
   *
   * @param {string} reference Markdown Reference
   * @param {string} file File/URL
   * @param {string|undefined} hash Extra Hash Content
   */
  const markdownFootUrls = (_, reference, file, hash = '') =>
    `${reference} ${DOC_WEB_BASE_PATH}${fileMetadata.version}/${file}.html${hash}`;

  /**
   * Increases the Heading Levels by 1, so that the only top-level heading
   * is the title of the page
   *
   * @param {string} l The Heading Hashes (#)
   */
  const addHeadingLevel = (_, l) => {
    // trim the string and calculate length as there might be whitespace
    const level = l.trim().length;

    return `${'#'.repeat(level === 6 ? level : level + 1)} `;
  };

  /**
   * This Utility replace links in the <https://example.org>
   * into standard Markdown Links [https://example.org](https://example.oirg)
   *
   * @param {string} link The plain Markdown Link
   */
  const normalizeLinks = (_, link) => `[${link}](${link})`;

  /**
   * Transforms plain reference to Web/JavaScript/Node.js types
   * into Markdown links containing the proper reference to said types
   *
   * @param {string} source The type source
   */
  const normalizeTypes = source =>
    parserUtils.transformTypeToReferenceLink(fileMetadata, source);

  /**
   * Allows us to do extra handling for Navigation
   * or transforming the prefixes of a Heading
   *
   * @param {string} prefix Heading Hashes Prefix
   * @param {string} type The Heading Type Prefix
   */
  const normalizeHeading = (_, prefix, type) => {
    switch (type) {
      case 'Class:':
        apiEntryMetadata.setType('class');
        break;
      case 'Event:':
        apiEntryMetadata.setType('event');
        break;
      case 'Static method:':
        apiEntryMetadata.setType('classMethod');
        break;
      default:
        apiEntryMetadata.setType('method');
        break;
    }

    return `${prefix} ${type}`;
  };

  /**
   * Parses Markdown YAML source into a JavaScript object containing all the metadata
   * (this is forwarded to the parser so it knows what to do with said metadata)
   *
   * @param {string} yamlString The YAML code block from the Markdown content
   */
  const parseYAML = (_, yamlString) =>
    parserUtils.parseYAMLIntoMetadata(apiEntryMetadata, yamlString);

  return {
    markdownFootUrls,
    addHeadingLevel,
    normalizeLinks,
    normalizeTypes,
    normalizeHeading,
    parseYAML,
  };
};

// This defines the actual REGEX Queries
createQueries.QUERIES = {
  // Fixes the references to Markdown pages into the API documentation
  markdownFootUrls: /(^\[.+\]:) ([a-z]+)\.md([#-_]+)?/gim,
  // ReGeX for increasing the heading level
  addHeadingLevel: /^(#{1,6}\s)/,
  // ReGeX for non-valid Markdown Links
  // Which then are fixed into correct Links
  normalizeLinks: /<(https:\/\/.+)>/gm,
  // ReGeX to match the {Type}<Type> (Structure Type metadatas)
  // eslint-disable-next-line no-useless-escape
  normalizeTypes: /(\{|<)(?! )[a-z0-9.| \n\[\]\\]+(?! )(\}|>)/gim,
  // ReGeX for handling numerous pieces of specific Headings
  // that are usually used for Classes, Events, Modules, etc
  normalizeHeading: /^(#{3,5}) (Class:|Event:|`.+`|Static method:)/,
  // ReGeX to match the in-line YAML metadatas
  parseYAML: /^<!--([\s\S]*?)-->/,
  // ReGeX for replacing the Stability Index with a MDX Component
  // @TODO: Only used for the MDX Generator
  stabilityIndex: /^> (.*:)\s*(\d)([\s\S]*)/,
};

export default createQueries;
