'use strict';

import { u as createTree } from 'unist-builder';
import { findAfter } from 'unist-util-find-after';
import { remove } from 'unist-util-remove';
import { selectAll } from 'unist-util-select';
import { SKIP, visit } from 'unist-util-visit';

import createMetadata from '../metadata.mjs';
import createQueries from '../queries.mjs';

import { getRemark } from '../utils/remark.mjs';
import { createNodeSlugger } from '../utils/slugger.mjs';

/**
 * Creates an API doc parser for a given Markdown API doc file
 *
 * @param {import('./linter/index.mjs').Linter | undefined} linter
 */
const createParser = linter => {
  // Creates an instance of the Remark processor with GFM support
  // which is used for stringifying the AST tree back to Markdown
  const remarkProcessor = getRemark();
  linter?.info('asd123');
  const {
    setHeadingMetadata,
    addYAMLMetadata,
    updateMarkdownLink,
    updateTypeReference,
    updateLinkReference,
    addStabilityMetadata,
    updateStabilityPrefixToLink,
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
     * @type {Array<ApiDocMetadataEntry>}
     */
    const metadataCollection = [];

    // Creates a new Slugger instance for the current API doc file
    const nodeSlugger = createNodeSlugger();

    // We allow the API doc VFile to be a Promise of a VFile also,
    // hence we want to ensure that it first resolves before we pass it to the parser
    const resolvedApiDoc = await Promise.resolve(apiDoc);

    // Normalizes all the Stability Index prefixes with Markdown links
    updateStabilityPrefixToLink(resolvedApiDoc);

    // Parses the API doc into an AST tree using `unified` and `remark`
    const apiDocTree = remarkProcessor.parse(resolvedApiDoc);

    // Get all Markdown Footnote definitions from the tree
    const markdownDefinitions = selectAll('definition', apiDocTree);

    // Get all Markdown Heading entries from the tree
    const headingNodes = selectAll('heading', apiDocTree);

    // Handles Markdown link references and updates them to be plain links
    visit(apiDocTree, createQueries.UNIST.isLinkReference, node =>
      updateLinkReference(node, markdownDefinitions)
    );

    // Removes all the original definitions from the tree as they are not needed
    // anymore, since all link references got updated to be plain links
    remove(apiDocTree, markdownDefinitions);

    // Handles the normalisation URLs that reference to API doc files with .md extension
    // to replace the .md into .html, since the API doc files get eventually compiled as HTML
    visit(apiDocTree, createQueries.UNIST.isMarkdownUrl, node =>
      updateMarkdownLink(node)
    );

    // If the document has no headings but it has content, we add a fake heading to the top
    // so that our parsing logic can work correctly, and generate content for the whole file
    if (headingNodes.length === 0 && apiDocTree.children.length > 0) {
      apiDocTree.children.unshift(createTree('heading', { depth: 1 }, []));
    }

    // Handles iterating the tree and creating subtrees for each API doc entry
    // where an API doc entry is defined by a Heading Node
    // (so all elements after a Heading until the next Heading)
    // and then it creates and updates a Metadata entry for each API doc entry
    // and then generates the final content for each API doc entry and pushes it to the collection
    visit(apiDocTree, createQueries.UNIST.isHeading, (headingNode, index) => {
      // Creates a new Metadata entry for the current API doc file
      const apiEntryMetadata = createMetadata(nodeSlugger);

      // Adds the Metadata of the current Heading Node to the Metadata entry
      setHeadingMetadata(headingNode, apiEntryMetadata);

      // We retrieve the immediate next Heading if it exists
      // This is used for ensuring that we don't include items that would
      // belong only to the next heading to the current Heading metadata
      // Note that if there is no next heading, we use the current node as the next one
      const nextHeadingNode =
        findAfter(apiDocTree, index, createQueries.UNIST.isHeading) ??
        headingNode;

      // This is the cutover index of the subtree that we should get
      // of all the Nodes within the AST tree that belong to this section
      // If `next` is equals the current heading, it means there's no next heading
      // and we are reaching the end of the document, hence the cutover should be the end of
      // the document itself.
      const stop =
        headingNode === nextHeadingNode
          ? apiDocTree.children.length
          : apiDocTree.children.indexOf(nextHeadingNode);

      // Retrieves all the nodes that should belong to the current API docs section
      // `index + 1` is used to skip the current Heading Node
      const subTree = createTree(
        'root',
        apiDocTree.children.slice(index, stop)
      );

      // Visits all Stability Index nodes from the current subtree if there's any
      // and then apply the Stability Index metadata to the current metadata entry
      visit(subTree, createQueries.UNIST.isStabilityNode, node =>
        addStabilityMetadata(node, apiEntryMetadata)
      );

      // Visits all HTML nodes from the current subtree and if there's any that matches
      // our YAML metadata structure, it transforms into YAML metadata
      // and then apply the YAML Metadata to the current Metadata entry
      visit(subTree, createQueries.UNIST.isYamlNode, node =>
        addYAMLMetadata(node, apiEntryMetadata)
      );

      // Visits all Text nodes from the current subtree and if there's any that matches
      // any API doc type reference and then updates the type reference to be a Markdown link
      visit(subTree, createQueries.UNIST.isTextWithType, (node, _, parent) =>
        updateTypeReference(node, parent)
      );

      // Removes already parsed items from the subtree so that they aren't included in the final content
      remove(subTree, [createQueries.UNIST.isYamlNode]);

      // Applies the AST transformations to the subtree based on the API doc entry Metadata
      // Note that running the transformation on the subtree isn't costly as it is a reduced tree
      // and the GFM transformations aren't that heavy
      const parsedSubTree = remarkProcessor.runSync(subTree);

      // We seal and create the API doc entry Metadata and push them to the collection
      const parsedApiEntryMetadata = apiEntryMetadata.create(
        resolvedApiDoc,
        parsedSubTree
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
