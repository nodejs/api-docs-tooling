'use strict';

import { VFile } from 'vfile';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { SKIP, visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';
import { findAfter } from 'unist-util-find-after';
import { findAllAfter } from 'unist-util-find-all-after';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { createNodeSlugger } from './utils/slugger.mjs';
import { callIfBefore } from './utils/parser.mjs';

// Characters used to split each section within an API Doc file
const DOC_API_ENTRY_SEPARATOR = /^#{1,4} .*/gm;

/**
 * Creates an API doc parser for a given Markdown API doc file
 */
const createParser = () => {
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
     * @type {Array<ReturnType<import('./metadata.mjs').default>}
     */
    const metadataCollection = [];

    // Creates an instance of the Node slugger per API doc file
    const nodeSlugger = createNodeSlugger();

    // Creates a new Remark processor with GFM (GitHub Flavoured Markdown) support
    const apiDocProcessor = remark().use(remarkGfm);

    // Adds a transformer for handling link references and Markdown definitions
    apiDocProcessor.use(() => {
      return tree => {
        // Get all Markdown Footnote definitions from the tree
        const markdownDefinitions = selectAll('definition', tree);

        // Handles Link References
        visit(tree, createQueries.UNIST.isLinkReference, node => {
          updateLinkReference(node, markdownDefinitions);

          return SKIP;
        });

        // Removes all the original definitions from the tree as they are not needed
        // anymore, since all link references got updated to be plain links
        remove(tree, markdownDefinitions);
      };
    });

    // Adds a transformer for normalising the Markdown file with numerous actions
    // that are required for the API docs to be correctly parsed
    apiDocProcessor.use(() => {
      return tree => {
        // Handles API type references transformation into links
        visit(tree, createQueries.UNIST.isTextWithType, node => {
          updateTypeToReferenceLink(node);

          return SKIP;
        });

        // Handles normalisation of Markdown URLs
        visit(tree, createQueries.UNIST.isMarkdownUrl, node => {
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
        visit(tree, createQueries.UNIST.isHeadingNode, node => {
          // Creates a new Metadata entry for the current API doc file
          const apiEntryMetadata = createMetadata(nodeSlugger);

          // Adds the Metadata of the current Heading Node to the Metadata entry
          addHeadingMetadata(node, apiEntryMetadata);

          // We retrieve the immediate next Heading if it exists
          // This is used for ensuring that we don't include items that would
          // belong only to the next heading to the current Heading metadata
          callIfBefore(findAfter(tree, node, 'heading'), node, next => {
            // Gets the next available Stability Index Node (if any)
            // from the current Heading Node, and then adds it to the current Metadata
            // if the found Stability Index Node is before the next Heading Node
            // we then add it to the current Metadata
            const stabilityIndexNodes = findAllAfter(
              tree,
              node,
              createQueries.UNIST.isStabilityIndex
            );

            // Gets the next available YAML Node (if any)
            // from the current Heading Node, and then adds it to the current Metadata
            // if the found YAML Node is before the next Heading Node
            // we then add it to the current Metadata
            const yamlMetadataNodes = findAllAfter(
              tree,
              node,
              createQueries.UNIST.isYamlNode
            );

            stabilityIndexNodes.forEach(stabilityIndexNode => {
              callIfBefore(next, stabilityIndexNode, () => {
                // Adds the Stability Index Metadata to the current Metadata entry
                addStabilityIndexMetadata(stabilityIndexNode, apiEntryMetadata);

                remove(tree, stabilityIndexNode);
              });
            });

            yamlMetadataNodes.forEach(yamlMetadataNode => {
              callIfBefore(next, yamlMetadataNode, () => {
                // Adds the YAML Metadata to the current Metadata entry
                addYAMLMetadata(yamlMetadataNode, apiEntryMetadata);

                remove(tree, yamlMetadataNode);
              });
            });
          });

          // After all is processed for the current Heading we proceed to push it
          // to the Metadata collection, so that it can be sealed later on
          metadataCollection.push(apiEntryMetadata);

          return SKIP;
        });
      };
    });

    // Processes the API doc file and returns the parsed API doc
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

  return { parseApiDocs };
};

export default createParser;
