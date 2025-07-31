'use strict';

import { coerce } from 'semver';

import { loadFromURL } from '../utils/parser.mjs';
import createQueries from '../utils/queries/index.mjs';
import { MD_LINKED_LIST_ITEM, NODE_VERSIONS } from '../utils/queries/regex.mjs';
import { getRemark } from '../utils/remark.mjs';

const LTS = 'long term support';

/**
 * Creates an API doc parser for a given Markdown API doc file
 *
 * @param {import('../linter/types').Linter} [linter]
 */
const createParser = linter => {
  // Creates an instance of the Remark processor with GFM support
  const remarkProcessor = getRemark();

  const { updateStabilityPrefixToLink } = createQueries();

  /**
   * Parses a given API doc file into a AST tree
   *
   * @param {import('vfile').VFile | Promise<import('vfile').VFile>} apiDoc
   * @returns {Promise<ParserOutput<import('mdast').Root>>}
   */
  const parseApiDoc = async apiDoc => {
    // We allow the API doc VFile to be a Promise of a VFile also,
    // hence we want to ensure that it first resolves before we pass it to the parser
    const resolvedApiDoc = await Promise.resolve(apiDoc);

    // Normalizes all the Stability Index prefixes with Markdown links
    updateStabilityPrefixToLink(resolvedApiDoc);

    // Parses the API doc into an AST tree using `unified` and `remark`
    const apiDocTree = remarkProcessor.parse(resolvedApiDoc);

    linter?.lint(resolvedApiDoc, apiDocTree);

    return {
      file: {
        stem: resolvedApiDoc.stem,
        basename: resolvedApiDoc.basename,
      },
      tree: apiDocTree,
    };
  };

  /**
   * This method allows to parse multiple API doc files at once
   * and it simply wraps parseApiDoc with the given API docs
   *
   * @param {Array<import('vfile').VFile | Promise<import('vfile').VFile>>} apiDocs List of API doc files to be parsed
   * @returns {Promise<Array<ParserOutput<import('mdast').Root>>>}
   */
  const parseApiDocs = async apiDocs => {
    // We do a Promise.all, to ensure that each API doc is resolved asynchronously
    // but all need to be resolved first before we return the result to the caller
    return Promise.all(apiDocs.map(parseApiDoc));
  };

  return { parseApiDocs, parseApiDoc };
};

/**
 * Retrieves all Node.js major versions from the provided CHANGELOG.md file
 * and returns an array of objects containing the version and LTS status.
 * @param {string|URL} path Path to changelog
 * @returns {Promise<Array<ApiDocReleaseEntry>>}
 */
export const parseChangelog = async path => {
  const changelog = await loadFromURL(path);

  const nodeMajors = Array.from(changelog.matchAll(NODE_VERSIONS));

  return nodeMajors.map(match => ({
    version: coerce(match[1]),
    isLts: match[2].toLowerCase().includes(LTS),
  }));
};

/**
 * Retrieves all the document titles for sidebar generation.
 *
 * @param {string|URL} path Path to changelog
 * @returns {Promise<Array<{ section: string, api: string }>>}
 */
export const parseIndex = async path => {
  const index = await loadFromURL(path);

  const items = Array.from(index.matchAll(MD_LINKED_LIST_ITEM));

  return items.map(([, section, api]) => ({ section, api }));
};

export default createParser;
