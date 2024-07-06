'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

// Creates a Remark Parser with all Plugins needed for our API Docs
const getRemarkParser = () => remark().use(remarkGfm);

/**
 * Creates an API Doc Parser for a given Markdown API Doc
 * (this requires already parsed Node.js release data, the API doc file to be loaded, and etc)
 */
const createParser = () => {
  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata();

  /**
   * Parses a given API Doc Metadata file into a list of Metadata Entries
   *
   * @param {import('vfile').VFile} apiDoc
   */
  const parseApiDoc = async apiDoc => {
    // Does extra modification at the root level of the API Doc File
    const apiDocRootParser = getRemarkParser().use(() => {
      return tree => {
        const definitions = selectAll('definition', tree);

        const { updateLinkReference } = createQueries(undefined, definitions);

        // Handles Link References
        visit(tree, createQueries.UNIST_TESTS.isLinkReference, node => {
          updateLinkReference(node);
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
    const parsedSections = markdownSections.map(sectionSource => {
      const apiEntryMetadata = newMetadataEntry();

      const {
        addYAMLMetadata,
        updateTypeToReferenceLink,
        addHeadingMetadata,
        updateMarkdownLink,
        addStabilityIndexMeta,
      } = createQueries(apiEntryMetadata);

      const apiDocSectionParser = getRemarkParser().use(() => {
        return tree => {
          // Handles YAML Metadata
          visit(tree, createQueries.UNIST_TESTS.isYamlNode, node => {
            addYAMLMetadata(node);

            remove(tree, node);
          });

          // Handles Markdown Headings
          visit(tree, createQueries.UNIST_TESTS.isHeadingNode, node => {
            addHeadingMetadata(node);

            remove(tree, node);
          });

          // Handles Stability Indexes
          visit(tree, createQueries.UNIST_TESTS.isStabilityIndex, node => {
            addStabilityIndexMeta(node);

            remove(tree, node);
          });

          // Handles API Type References transformation into Links
          visit(tree, createQueries.UNIST_TESTS.isTextWithType, node => {
            updateTypeToReferenceLink(node);
          });

          // Handles Normalisation of Markdown URLs
          visit(tree, createQueries.UNIST_TESTS.isMarkdownUrl, node => {
            updateMarkdownLink(node);
          });
        };
      });

      // Process the Markdown Section into a VFile with the processed data
      const parsedSection = apiDocSectionParser.processSync(sectionSource);

      // Creates a Metadata Entry (VFile) and returns it
      return apiEntryMetadata.create(apiDoc.stem, parsedSection);
    });

    return parsedSections;
  };

  /**
   * This method allows to parse multiple API Doc Files at once
   * and it simply wraps parseApiDoc with the given API Docs
   *
   * @param {Array<import('vfile').VFile>} apiDocs
   */
  const parseApiDocs = async apiDocs => {
    const apiMetadataEntries = [];

    for (const apiDoc of apiDocs) {
      const parsedEntries = await parseApiDoc(apiDoc);

      apiMetadataEntries.push(...parsedEntries);
    }

    return apiMetadataEntries;
  };

  return { getNavigation, parseApiDocs };
};

export default createParser;
