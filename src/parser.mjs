'use strict';

import { VFile } from 'vfile';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { u } from 'unist-builder';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';
import { SKIP, visit } from 'unist-util-visit';
import { findAfter } from 'unist-util-find-after';
import { findAllAfter } from 'unist-util-find-all-after';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { createNodeSlugger } from './utils/slugger.mjs';
import { callIfBefore } from './utils/unist.mjs';

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
     * @type {Array<import('./types.d.ts').ApiDocMetadataEntry>}
     */
    const metadataCollection = [];

    // Creates an instance of the Node slugger per API doc file
    const nodeSlugger = createNodeSlugger();

    // Creates a new Remark processor with GFM (GitHub Flavoured Markdown) support
    const apiDocProcessor = remark().use(remarkGfm);

    // Adds a transformer for handling link references and Markdown definitions
    apiDocProcessor.use(() => {
      /**
       * This transformer is responsible for handling link references and Markdown definitions
       *
       * @param {import('unist').Parent} tree The root AST tree for the API doc file
       */
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
      /**
       * This transformer is responsible for normalising the Markdown file
       *
       * @param {import('unist').Parent} tree The root AST tree for the API doc file
       */
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
      /**
       * Iterates through the AST tree and creates Metadata entries for each API doc section
       *
       * @param {import('unist').Parent} tree The root AST tree for the API doc file
       */
      return tree => {
        visit(tree, createQueries.UNIST.isHeadingNode, (node, index) => {
          // Creates a new Metadata entry for the current API doc file
          const apiEntryMetadata = createMetadata(nodeSlugger);

          // Adds the Metadata of the current Heading Node to the Metadata entry
          addHeadingMetadata(node, apiEntryMetadata);

          // We retrieve the immediate next Heading if it exists
          // This is used for ensuring that we don't include items that would
          // belong only to the next heading to the current Heading metadata
          // Note that if there is no next heading, we use the current node as the next one
          const nextHeadingNode = findAfter(tree, index, 'heading') ?? node;

          callIfBefore(nextHeadingNode, node, next => {
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
              // If the next heading === current one, then we use the stabilityIndex
              // itself as the check, since this means we reaching the end of the document
              const toCheckAgainst = node === next ? stabilityIndexNode : next;

              callIfBefore(toCheckAgainst, stabilityIndexNode, () => {
                // Adds the Stability Index Metadata to the current Metadata entry
                addStabilityIndexMetadata(stabilityIndexNode, apiEntryMetadata);

                remove(tree, stabilityIndexNode);
              });
            });

            yamlMetadataNodes.forEach(yamlMetadataNode => {
              // If the next heading === current one, then we use the yamlMetadataNode
              // itself as the check, since this means we reaching the end of the document
              const toCheckAgainst = node === next ? yamlMetadataNode : next;

              callIfBefore(toCheckAgainst, yamlMetadataNode, () => {
                // Adds the YAML Metadata to the current Metadata entry
                addYAMLMetadata(yamlMetadataNode, apiEntryMetadata);

                remove(tree, yamlMetadataNode);
              });
            });

            // This is the cutover index of the subtree that we should get
            // of all the Nodes within the AST tree that belong to this section
            // If `next` is equals the current heading, it means ther's no next heading
            // and we are reaching the end of the document, hence the cutover should be the end of
            // the document itself,
            // Note.: This index needs to be retrieved after any modification to the tree occurs,
            // otherwise the index will be off (out of sync with the tree)
            const cutoverIndex =
              node === next
                ? tree.children.length - 1
                : tree.children.indexOf(next);

            // Retrieves all the Nodes that should belong to the current API doc section
            const sectionNodes = tree.children.slice(index + 1, cutoverIndex);

            // The stringified (back to Markdown) content of the section
            const sectionParsedContent = apiDocProcessor.stringify(
              // Creates a subtree based on the section Nodes
              u('root', sectionNodes),
              apiDoc
            );

            // We seal and create the API doc entry Metadata and push them to the collection
            // Creates the API doc entry Metadata and pushes it to the collection
            const parsedApiEntryMetadata = apiEntryMetadata.create(
              apiDoc.stem,
              // Creates a VFile for the current section content
              new VFile({ ...apiDoc, value: sectionParsedContent })
            );

            // We push the parsed API doc entry Metadata to the collection
            metadataCollection.push(parsedApiEntryMetadata);

            // Finally, we remove the Heading from the tree as it's no longer needed
            remove(tree, node);
          });

          return SKIP;
        });
      };
    });

    console.log(`[parser] parsing: ${apiDoc.stem}`);

    // Parses the API doc into an AST tree using `unified` and `remark`
    const apiDocTree = apiDocProcessor.parse(apiDoc);

    // Applies the AST transformers defined before to the API doc tree
    await apiDocProcessor.run(apiDocTree);

    return metadataCollection;
  };

  /**
   * This method allows to parse multiple API doc files at once
   * and it simply wraps parseApiDoc with the given API docs
   *
   * @param {Array<import('vfile').VFile>} apiDocs List of API doc files to be parsed
   */
  const parseApiDocs = async apiDocs => {
    const apiDocsParsedPromise = await Promise.all(apiDocs.map(parseApiDoc));

    return apiDocsParsedPromise.flat();
  };

  return { parseApiDocs };
};

export default createParser;
