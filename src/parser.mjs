'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import { u } from 'unist-builder';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';
import { SKIP, visit } from 'unist-util-visit';
import { findAfter } from 'unist-util-find-after';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';

import { createNodeSlugger } from './utils/slugger.mjs';

/**
 * Creates an API doc parser for a given Markdown API doc file
 */
const createParser = () => {
  // Creates an instance of the Remark processor with GFM support
  // which is used for stringifying the AST tree back to Markdown
  const remarkGfmProcessor = remark().use(remarkGfm);

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
   * @param {import('vfile').VFile | Promise<import('vfile').VFile>} apiDoc
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

    // We allow the API doc VFile to be a Promise of a VFile also,
    // hence we want to ensure that it first resolves before we pass it to the parser
    const resolvedApiDoc = await Promise.resolve(apiDoc);

    // Creates a new Slugger instance for the current API doc file
    const nodeSlugger = createNodeSlugger();

    // Parses the API doc into an AST tree using `unified` and `remark`
    const tree = remarkGfmProcessor.parse(resolvedApiDoc);

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

    visit(tree, createQueries.UNIST.isHeadingNode, (headingNode, index) => {
      // Creates a new Metadata entry for the current API doc file
      const apiEntryMetadata = createMetadata(nodeSlugger, remarkGfmProcessor);

      // Adds the Metadata of the current Heading Node to the Metadata entry
      addHeadingMetadata(headingNode, apiEntryMetadata);

      // We retrieve the immediate next Heading if it exists
      // This is used for ensuring that we don't include items that would
      // belong only to the next heading to the current Heading metadata
      // Note that if there is no next heading, we use the current node as the next one
      const nextHeadingNode =
        findAfter(tree, index, createQueries.UNIST.isHeadingNode) ??
        headingNode;

      // This is the cutover index of the subtree that we should get
      // of all the Nodes within the AST tree that belong to this section
      // If `next` is equals the current heading, it means ther's no next heading
      // and we are reaching the end of the document, hence the cutover should be the end of
      // the document itself,
      // Note.: This index needs to be retrieved after any modification to the tree occurs,
      // otherwise the index will be off (out of sync with the tree)
      const stop =
        headingNode === nextHeadingNode
          ? tree.children.length - 1
          : tree.children.indexOf(nextHeadingNode);

      // Retrieves all the Nodes that should belong to the current API doc section
      // `index + 1` is used to skip the current Heading Node
      const subtree = u('root', tree.children.slice(index + 1, stop));

      // Visits all Stability Index Nodes from the current subtree if there's any
      // and then apply the Stability Index Metadata to the current Metadata entry
      visit(subtree, createQueries.UNIST.isStabilityIndex, node => {
        // Adds the Stability Index Metadata to the current Metadata entry
        addStabilityIndexMetadata(node, apiEntryMetadata);

        return SKIP;
      });

      // Visits all YAML Nodes from the current subtree if there's any
      // and then apply the YAML Metadata to the current Metadata entry
      visit(subtree, createQueries.UNIST.isYamlNode, node => {
        // Adds the YAML Metadata to the current Metadata entry
        addYAMLMetadata(node, apiEntryMetadata);

        return SKIP;
      });

      // Removes already parsed items from the subtree so that they aren't included in the final content
      remove(subtree, [
        createQueries.UNIST.isStabilityIndex,
        createQueries.UNIST.isYamlNode,
      ]);

      // We seal and create the API doc entry Metadata and push them to the collection
      // Creates the API doc entry Metadata and pushes it to the collection
      const parsedApiEntryMetadata = apiEntryMetadata.create(
        resolvedApiDoc.stem,
        // Applies the AST transformations to the subtree based on the API doc entry Metadata
        // Note that running the transformation on the subtree isn't costly as it is a reduced tree
        // and the GFM transformations aren't that heavy
        remarkGfmProcessor.runSync(subtree)
      );

      // We push the parsed API doc entry Metadata to the collection
      metadataCollection.push(parsedApiEntryMetadata);

      return SKIP;
    });

    // Returns the Metadata entries for the given API doc file
    return metadataCollection;
  };

  /**
   * This method allows to parse multiple API doc files at once
   * and it simply wraps parseApiDoc with the given API docs
   *
   * @param {Array<import('vfile').VFile | Promise<import('vfile').VFile>>} apiDocs List of API doc files to be parsed
   */
  const parseApiDocs = async apiDocs => {
    // We do a Promise.all, to ensure that each API doc is resolved asynchronously
    // but all need to be resolved first before we return the result to the caller
    const resolvedApiDocEntries = await Promise.all(apiDocs.map(parseApiDoc));

    return resolvedApiDocEntries.flat();
  };

  return { parseApiDocs, parseApiDoc };
};

export default createParser;
