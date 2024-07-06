'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { transformNodesToRaw } from './utils/unist.mjs';
import { parseHeadingIntoMetadata } from './utils/parser.mjs';

// Creates a Remark Parser with all Plugins needed for our API Docs
const getRemarkParser = () => remark().use(remarkGfm);

/**
 * Creates an API Doc Parser for a given Markdown API Doc
 * (this requires already parsed Node.js release data, the API doc file to be loaded, and etc)
 */
const createParser = () => {
  const { getReferenceLink, parseYAML } = createQueries();

  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata();

  /**
   * Parses a given API Doc Metadata file into a list of Metadata Entries
   *
   * @param {import('vfile').VFile} apiDoc
   */
  const parseMetadata = async apiDoc => {
    // Does extra modification at the root level of the API Doc File
    const apiDocRootParser = getRemarkParser().use(() => {
      return tree => {
        const definitions = selectAll('definition', tree);

        // Handles Link References
        visit(tree, createQueries.UNIST_TESTS.isLinkReference, node => {
          const definition = definitions.find(
            ({ identifier }) => identifier === node.identifier
          );

          node.type = 'link';
          node.url = definition.url;
        });

        // Removes the Definitions from the Tree
        remove(tree, definitions);
      };
    });

    const parsedRoot = await apiDocRootParser.process(apiDoc);

    // Gathers each Markdown Section within the API Doc
    // by separating chunks of the source (root) by heading separators
    const markdownSections = parsedRoot.toString().split('\n\n#');

    // Parses each Markdown Section into a Metadata Entry
    const parsedSections = markdownSections.map(async sectionSource => {
      const apiEntryMetadata = newMetadataEntry();

      const apiDocSectionParser = getRemarkParser().use(() => {
        return (tree, section) => {
          // Handles YAML Metadata
          visit(tree, createQueries.UNIST_TESTS.isYamlNode, node => {
            const metadata = parseYAML(node.value);

            apiEntryMetadata.setProperties(metadata);

            remove(tree, node);
          });

          // Handles Markdown Headings
          visit(tree, createQueries.UNIST_TESTS.isHeadingNode, node => {
            const heading = transformNodesToRaw(node.children, section);

            const parsedHeading = parseHeadingIntoMetadata(
              heading,
              node.depth + 1
            );

            apiEntryMetadata.setHeading(parsedHeading);

            remove(tree, node);
          });

          // Handles API Type References transformation into Links
          visit(tree, createQueries.UNIST_TESTS.isTextWithType, node => {
            const parsedReference = node.value.replace(
              createQueries.QUERIES.normalizeTypes,
              getReferenceLink
            );

            node.type = 'html';
            node.value = parsedReference;
          });

          // Handles Normalisation of Markdown URLs
          visit(tree, createQueries.UNIST_TESTS.isMarkdownUrl, node => {
            node.url = node.url.replace(
              createQueries.QUERIES.markdownUrl,
              (_, filename, hash = '') => `${filename}.html${hash}`
            );
          });
        };
      });

      // Process the Markdown Section into a VFile with the processed data
      const parsedSection = await apiDocSectionParser.process(sectionSource);

      // Creates a Metadata Entry (VFile) and returns it
      return apiEntryMetadata.create(apiDoc.stem, parsedSection);
    });

    return parsedSections;
  };

  return { getNavigation, parseMetadata };
};

export default createParser;
