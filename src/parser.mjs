'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

const getRemarkParser = () => remark().use(remarkGfm);

/**
 * Creates an API Doc Parser for a given Markdown API Doc
 * (this requires already parsed Node.js release data, the API doc file to be loaded, and etc)
 *
 * @param {import('./types.d.ts').ApiDocMetadata} fileMetadata API Doc Metadata
 * @param {string} markdownContent
 */
const createParser = (fileMetadata, markdownContent) => {
  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata(fileMetadata);

  const parseMetadata = () => {
    const markdownSections = markdownContent.split('\n\n#');

    const parsedSections = markdownSections.map(section => {
      const apiEntryMetadata = newMetadataEntry();

      const { getReferenceLink, getHeadingType, parseYAML } = createQueries(
        apiEntryMetadata,
        fileMetadata
      );

      const markdownParser = getRemarkParser().use(() => {
        return tree => {
          // Handles YAML Metadata
          visit(tree, createQueries.TESTS.isYamlNode, node => {
            const metadata = parseYAML(node.value);

            apiEntryMetadata.setProperties(metadata);

            remove(tree, node);
          });

          // Handles Markdown Headings
          visit(tree, createQueries.TESTS.isHeadingNode, node => {
            const heading = node.children.map(({ value }) => value).join('');

            apiEntryMetadata.setHeading(heading);
            apiEntryMetadata.setType(getHeadingType(heading, node.depth + 1));

            remove(tree, node);
          });

          // Handles API Type References transformation into Links
          visit(tree, createQueries.TESTS.isTextWithType, node => {
            node.value = node.value.replace(
              createQueries.QUERIES.normalizeTypes,
              getReferenceLink
            );
          });

          // Handles Normalisation of Markdown URLs
          visit(tree, createQueries.TESTS.isMarkdownFootUrl, node => {
            node.url = node.url.replace(
              createQueries.QUERIES.markdownFootUrls,
              (_, filename, hash = '') => `${filename}.html${hash}`
            );
          });

          // Moves Definitions to the Root
          visit(tree, 'root', node => {
            const definitions = selectAll('definition', tree);

            node.children.concat(definitions);

            remove(tree, definitions);
          });
        };
      });

      return apiEntryMetadata.create(markdownParser.processSync(section));
    });

    return parsedSections;
  };

  return { getNavigation, parseMetadata };
};

export default createParser;
