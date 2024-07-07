'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { SKIP, visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { createNodeSlugger } from './utils/slugger.mjs';
import { DOC_API_SECTION_SEPARATOR as DOC_API_ENTRY_SEPARATOR } from './constants.mjs';
import { VFile } from 'vfile';

/**
 * Creates an API doc parser for a given Markdown API doc file
 */
const createParser = () => {
  const nodeSlugger = createNodeSlugger();

  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata(nodeSlugger);

  const {
    updateLinkReference,
    updateTypeToReferenceLink,
    updateMarkdownLink,
    addYAMLMetadata,
    addHeadingMetadata,
    addStabilityIndexMetadata,
  } = createQueries();

  /**
   * Parses a given API doc metadata file into a list of Metadata entries
   *
   * @param {import('vfile').VFile} apiDoc
   */
  const parseApiDoc = async apiDoc => {
    /**
     * This holds references to all the Metadata entries for a given file
     * this is used so we can traverse the AST tree and keep mutating things
     * and then stringify the whole api doc file at once without creating sub traversals
     *
     * Then once we have the whole file parsed, we can split the resulting string into sections
     * and seal the Metadata Entries (`.create()`) and return the result to the caller of parae.
     *
     * @type {Array<ReturnType<ReturnType<import('./metadata.mjs').default>['newMetadataEntry']>}
     */
    const metadataCollection = [];

    // Resets the Slugger as we are parsing a new API doc file
    nodeSlugger.reset();

    // Creates a new Remark processor with GFM (GitHub Flavoured Markdown) support
    const apiDocProcessor = remark().use(remarkGfm);

    // Adds a transformer for handling link references and Markdown definitions
    apiDocProcessor.use(() => {
      return tree => {
        // Get all Markdown Footnote definitions from the tree
        const definitions = selectAll('definition', tree);

        // Handles Link References
        visit(tree, createQueries.UNIST_TESTS.isLinkReference, node => {
          updateLinkReference(node, definitions);

          return SKIP;
        });

        // Removes all the original definitions from the tree as they are not needed
        // anymore, since all link references got updated to be plain links
        remove(tree, definitions);
      };
    });

    // Adds a transformer for normalising the Markdown file with numerous actions
    // that are required for the API docs to be correctly parsed
    apiDocProcessor.use(() => {
      return tree => {
        // Handles API type references transformation into links
        visit(tree, createQueries.UNIST_TESTS.isTextWithType, node => {
          updateTypeToReferenceLink(node);

          return SKIP;
        });

        // Handles normalisation of Markdown URLs
        visit(tree, createQueries.UNIST_TESTS.isMarkdownUrl, node => {
          updateMarkdownLink(node);

          return SKIP;
        });
      };
    });

    // Adds a transformer for iterating through the Markdown file
    // and going over the sections and creating metadata entries by traversing the tree
    // A new metadata entry is created once a new Heading is found (from level 1 to 6)
    apiDocProcessor.use(() => {
      return tree => {
        // Handles Markdown Headings
        visit(tree, createQueries.UNIST_TESTS.isHeadingNode, node => {
          // Creates a new Metadata entry for the API doc file
          const apiEntryMetadata = newMetadataEntry();

          addHeadingMetadata(node, apiEntryMetadata);

          // Handles Stability Indexes
          visit(tree, createQueries.UNIST_TESTS.isStabilityIndex, node => {
            addStabilityIndexMetadata(node, apiEntryMetadata);

            remove(tree, node);

            return SKIP;
          });

          // Handles YAML metadata
          visit(tree, createQueries.UNIST_TESTS.isYamlNode, node => {
            addYAMLMetadata(node, apiEntryMetadata);

            remove(tree, node);

            return SKIP;
          });

          // Pushes them to the Metadata collection
          metadataCollection.push(apiEntryMetadata);

          return SKIP;
        });
      };
    });

    const parsedApiDoc = await apiDocProcessor.process(apiDoc);

    /**
     * Splits the parsed API doc file into sections (a section is defined by when a heading is found)
     * We consider up to level 4 headings as sections, and we split the file into sections
     *
     * @type {Array<string>}
     */
    const [, ...sections] = String(parsedApiDoc).split(DOC_API_ENTRY_SEPARATOR);

    // We iterate the Markdown sections and retrieve the parsed Metadata entries from when Unified
    // was iterating through the tree and then seal (create) the metadata entry for each section
    return sections.map((section, index) => {
      // This creates a new VFile with the top-level metadata of the API doc file
      // and the trimmed content of the section (which excludes the header, since it is already within the Metadata)
      const apiEntryFile = new VFile({ ...apiDoc, value: section.trim() });

      // Seals the Metadata entry with the actual content of the section
      return metadataCollection[index].create(apiDoc.stem, apiEntryFile);
    });
  };

  /**
   * This method allows to parse multiple API doc files at once
   * and it simply wraps parseApiDoc with the given API docs
   *
   * @param {Array<import('vfile').VFile>} apiDocs List of API doc files to be parsed
   */
  const parseApiDocs = apiDocs =>
    Promise.all(apiDocs.map(parseApiDoc)).then(entries => entries.flat());

  return { getNavigation, parseApiDocs };
};

export default createParser;
