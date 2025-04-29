'use strict';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DOC_API_LATEST_BASE_URL } from '../../constants.mjs';

const IGNORE_LIST = ['doc/api/synopsis.md'];

/**
 * Extracts text content from a node recursively
 *
 * @param {import('mdast').Paragraph} node The AST node to extract text from
 * @returns {string} The extracted text content
 */
function extractTextContent(node) {
  if (!node) {
    return '';
  }

  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextContent).join('');
  }

  return '';
}

/**
 * Extracts text from a paragraph node.
 *
 * @param {import('mdast').Paragraph} node The paragraph node to extract text from
 * @returns {string} The extracted text content
 * @throws {Error} If the node is not a paragraph
 */
function paragraphToString(node) {
  if (node.type !== 'paragraph') {
    throw new Error('Node is not a paragraph');
  }

  return node.children.map(extractTextContent).join('');
}

/**
 * Generates a documentation entry string
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {string}
 */
function generateDocEntry(entry) {
  if (IGNORE_LIST.includes(entry.api_doc_source)) {
    return null;
  }

  if (entry.heading.depth !== 1) {
    return null;
  }

  // Remove the leading /doc of string
  const path = entry.api_doc_source.replace(/^doc\//, '');

  const entryLink = `[${entry.heading.data.name}](${DOC_API_LATEST_BASE_URL}/${path})`;

  const descriptionNode = entry.content.children.find(
    child => child.type === 'paragraph'
  );

  if (!descriptionNode) {
    console.warn(`No description found for entry: ${entry.api_doc_source}`);
    return `- ${entryLink}`;
  }

  const description = paragraphToString(descriptionNode).replace(
    /[\r\n]+/g,
    ' '
  );

  return `- ${entryLink}: ${description}`;
}

/**
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'llms-txt',
  version: '0.1.0',
  description: 'Generates a llms.txt file of the API docs',
  dependsOn: 'ast',

  /**
   * @param {Input} input The API documentation metadata
   * @param {Partial<GeneratorOptions>} options Generator options
   * @returns {Promise<string>} The generated documentation text
   */
  async generate(input, options) {
    const output = [
      '# Node.js Documentation',
      '> Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for building scalable network applications.',
      '## Introduction',
      `- [About this documentation](${DOC_API_LATEST_BASE_URL}/api/documentation.md)`,
      `- [Usage and example](${DOC_API_LATEST_BASE_URL}/api/synopsis.md)`,
      '## API Documentation',
    ];

    const docEntries = input.map(generateDocEntry).filter(Boolean);

    output.push(...docEntries);

    const resultText = output.join('\n');

    if (options.output) {
      await writeFile(join(options.output, 'llms.txt'), resultText);
    }

    return resultText;
  },
};
