'use strict';

import { u as createTree } from 'unist-builder';
import { SKIP } from 'unist-util-visit';

import { DOC_API_STABILITY_SECTION_REF_URL } from './constants.mjs';
import {
  extractYamlContent,
  parseHeadingIntoMetadata,
  parseYAMLIntoMetadata,
  transformTypeToReferenceLink,
  transformUnixManualToLink,
} from '../parser/index.mjs';
import { getRemark } from '../remark.mjs';
import { transformNodesToString } from '../unist.mjs';
import {
  MARKDOWN_URL,
  STABILITY_INDEX,
  STABILITY_INDEX_PREFIX,
  TYPE_EXPRESSION,
  UNIX_MANUAL_PAGE,
} from './regex.mjs';

/**
 * Creates an instance of the Query Manager, which allows to do multiple sort
 * of metadata and content metadata manipulation within an API Doc
 */
const createQueries = () => {
  const remark = getRemark();
  /**
   * Sanitizes the YAML source by returning the inner YAML content
   * and then parsing it into an API Metadata object and updating the current Metadata
   *
   * @param {import('@types/mdast').Html} node A HTML node containing the YAML content
   * @param {ReturnType<import('../../metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addYAMLMetadata = (node, apiEntryMetadata) => {
    const yamlContent = extractYamlContent(node);

    apiEntryMetadata.updateProperties(parseYAMLIntoMetadata(yamlContent));

    return [SKIP];
  };

  /**
   * Parse a Heading node into metadata and updates the current metadata
   *
   * @param {import('@types/mdast').Heading} node A Markdown heading node
   * @param {ReturnType<import('../../metadata.mjs').default>} apiEntryMetadata The API entry Metadata
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
   * @param {import('@types/mdast').Link} node A Markdown link node
   */
  const updateMarkdownLink = node => {
    node.url = node.url.replace(
      MARKDOWN_URL,
      (_, filename, hash = '') => `${filename}.html${hash}`
    );

    return [SKIP];
  };

  /**
   * Updates a reference
   *
   * @param {import('@types/mdast').Text} node The current node
   * @param {import('@types/mdast').Parent} parent The parent node
   * @param {string|RegExp} query The search query
   * @param {Function} transformer The function to transform the reference
   *
   */
  const updateReferences = (query, transformer, node, parent) => {
    const replacedTypes = node.value
      .replace(query, transformer)
      // Remark doesn't handle leading / trailing spaces, so replace them with
      // HTML entities.
      .replace(/^\s/, '&nbsp;')
      .replace(/\s$/, '&nbsp;');

    // This changes the type into a link by splitting it up into several nodes,
    // and adding those nodes to the parent.
    const {
      children: [newNode],
    } = remark.parse(replacedTypes);

    // Find the index of the original node in the parent
    const index = parent.children.indexOf(node);

    // Replace the original node with the new node(s)
    parent.children.splice(index, 1, ...newNode.children);

    return [SKIP];
  };

  /**
   * Updates a Markdown Link Reference into an actual Link to the Definition
   *
   * @param {import('@types/mdast').LinkReference} node A link reference node
   * @param {Array<import('@types/mdast').Definition>} definitions The Definitions of the API Doc
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
   * @param {import('@types/mdast').Blockquote} node Thead Link Reference Node
   * @param {ReturnType<import('../../metadata.mjs').default>} apiEntryMetadata The API entry Metadata
   */
  const addStabilityMetadata = (node, apiEntryMetadata) => {
    // `node` is a `blockquote` node, and the first child will always be
    // a `paragraph` node, so we can safely access the children of the first child
    // which we use as the prefix and description of the Stability Index
    const stabilityPrefix = transformNodesToString(node.children[0].children);

    // Attempts to grab the Stability index and description from the prefix
    const matches = STABILITY_INDEX.exec(stabilityPrefix);

    // Ensures that the matches are valid and that we have at least 3 entries
    if (matches && matches.length === 3) {
      // Updates the `data` property of the Stability Index node
      // so that the original node data can also be inferred
      node.data = {
        // The 2nd match should be the group that matches the Stability Index
        index: matches[1],
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
      STABILITY_INDEX_PREFIX,
      match => `[${match}](${DOC_API_STABILITY_SECTION_REF_URL})`
    );
  };

  return {
    addYAMLMetadata,
    setHeadingMetadata,
    updateMarkdownLink,
    /** @param {Array<import('@types/mdast').Node>} args */
    updateTypeReference: (...args) =>
      updateReferences(TYPE_EXPRESSION, transformTypeToReferenceLink, ...args),
    /** @param {Array<import('@types/mdast').Node>} args */
    updateUnixManualReference: (...args) =>
      updateReferences(UNIX_MANUAL_PAGE, transformUnixManualToLink, ...args),
    updateLinkReference,
    addStabilityMetadata,
    updateStabilityPrefixToLink,
  };
};

export default createQueries;
