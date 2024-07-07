'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { createNodeSlugger } from './utils/slugger.mjs';
import { DOC_API_SECTION_SEPARATOR } from './constants.mjs';

// Creates a Remark parser with all Plugins needed for our API docs
const getRemarkParser = () => remark().use(remarkGfm);

/**
 * Creates an API doc parser for a given Markdown API doc file
 */
const createParser = () => {
  const slugger = createNodeSlugger();

  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata(slugger);

  /**
   * Parses a given API doc metadata file into a list of Metadata entries
   *
   * @param {import('vfile').VFile} apiDoc
   */
  const parseApiDoc = async apiDoc => {
    // Resets the Slugger as we are parsing a new API doc file
    slugger.reset();

    // Does extra modification at the root level of the API doc File
    const apiDocRootParser = getRemarkParser().use(() => {
      return tree => {
        const definitions = selectAll('definition', tree);

        const { updateLinkReference } = createQueries(undefined, definitions);

        // Handles Link References
        visit(tree, createQueries.UNIST_TESTS.isLinkReference, node => {
          updateLinkReference(node);
        });

        remove(tree, definitions);
      };
    });

    const parsedRoot = await apiDocRootParser.process(apiDoc);

    // Gathers each Markdown Section within the API doc
    // by separating chunks of the source (root) by heading separators
    // @TODO: Remove the splitting of the doc file, do a single traversal via `unified`
    // and determine beginning/end of sections based on encounter of a Heading Node
    const markdownSections = String(parsedRoot).split(
      DOC_API_SECTION_SEPARATOR
    );

    // Parses each Markdown section into a Metadata entry
    const parsedSections = markdownSections.map((section, index) => {
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
          // Handles YAML metadata
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

          // Handles API type references transformation into links
          visit(tree, createQueries.UNIST_TESTS.isTextWithType, node => {
            updateTypeToReferenceLink(node);
          });

          // Handles normalisation of Markdown URLs
          visit(tree, createQueries.UNIST_TESTS.isMarkdownUrl, node => {
            updateMarkdownLink(node);
          });
        };
      });

      // Process the Markdown section into a VFile with the processed data
      const parsedSection = apiDocSectionParser.processSync(
        // We add the `#` back to the beginning of the section source
        // since we split the document by the `DOC_API_SECTION_SEPARATOR`.
        // The only exception is the first entry, as it is not preceded by two blank lines
        // as shown on `DOC_API_SECTION_SEPARATOR`
        index > 0 ? `#${section}` : section
      );

      // Creates a Metadata entry (VFile) and returns it
      return apiEntryMetadata.create(apiDoc.stem, parsedSection);
    });

    return parsedSections;
  };

  /**
   * This method allows to parse multiple API doc files at once
   * and it simply wraps parseApiDoc with the given API docs
   *
   * @param {Array<import('vfile').VFile>} apiDocs List of API doc files to be parsed
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
