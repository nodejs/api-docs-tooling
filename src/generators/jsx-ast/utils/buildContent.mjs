'use strict';

import { h as createElement } from 'hastscript';
import {
  findTextPositions,
  getTreeLength,
  sliceMarkdown,
} from 'mdast-util-slice-markdown';
import { u as createTree } from 'unist-builder';
import { SKIP, visit } from 'unist-util-visit';

import { createJSXElement } from './ast.mjs';
import { buildMetaBarProps } from './buildBarProps.mjs';
import { DOC_NODE_BLOB_BASE_URL } from '../../../constants.mjs';
import { enforceArray } from '../../../utils/array.mjs';
import { sortChanges } from '../../../utils/generators.mjs';
import createQueries from '../../../utils/queries/index.mjs';
import { JSX_IMPORTS } from '../../web/constants.mjs';
import {
  STABILITY_LEVELS,
  LIFECYCLE_LABELS,
  INTERNATIONALIZABLE,
  STABILITY_PREFIX_LENGTH,
} from '../constants.mjs';
/**
 * Creates a history of changes for an API element
 * @param {ApiDocMetadataEntry} entry - The metadata entry containing change information
 * @returns {import('unist').Node|null} JSX element representing change history or null if no changes
 */
const createChangeElement = entry => {
  // Collect lifecycle changes (added, deprecated, etc.)
  const changeEntries = Object.entries(LIFECYCLE_LABELS)
    // Do we have this field?
    .filter(([field]) => entry[field])
    // Get the versions as an array
    .map(([field, label]) => [enforceArray(entry[field]), label])
    // Create the change entry
    .map(([versions, label]) => ({
      versions,
      label: `${label}: ${versions.join(', ')}`,
    }));

  // Add explicit changes if they exist
  if (entry.changes?.length) {
    const explicitChanges = entry.changes.map(change => ({
      versions: enforceArray(change.version),
      label: change.description,
      url: change['pr-url'],
    }));

    changeEntries.push(...explicitChanges);
  }

  if (!changeEntries.length) {
    return null;
  }

  // Sort by version, newest first and create the JSX element
  return createJSXElement(JSX_IMPORTS.ChangeHistory.name, {
    changes: sortChanges(changeEntries, 'versions').reverse(),
    className: 'ml-auto',
  });
};

/**
 * Creates a source link element if a source link is available
 * @param {string|undefined} sourceLink - The source link path
 * @returns {import('hastscript').Element|null} The source link element or null if no source link
 */
const createSourceLink = sourceLink => {
  if (!sourceLink) {
    return null;
  }

  return createElement('span', [
    INTERNATIONALIZABLE.sourceCode,
    createElement(
      'a',
      { href: `${DOC_NODE_BLOB_BASE_URL}${sourceLink}` },
      sourceLink
    ),
  ]);
};

/**
 * Transforms a stability node into an AlertBox JSX element
 * @param {import('mdast').Blockquote} node - The stability node to transform
 * @param {number} index - The index of the node in its parent's children array
 * @param {import('unist').Parent} parent - The parent node containing the stability node
 * @returns {[typeof SKIP]} Visitor instruction to skip the node
 */
const transformStabilityNode = (node, index, parent) => {
  const start = STABILITY_PREFIX_LENGTH + node.data.index.length;

  parent.children[index] = createJSXElement(JSX_IMPORTS.AlertBox.name, {
    children: sliceMarkdown(node, start, getTreeLength(node), {
      trimWhitespace: true,
    }).children,
    level: STABILITY_LEVELS[parseInt(node.data.index)],
    title: node.data.index,
  });

  return [SKIP];
};

/**
 * Enhances a heading node with metadata, source links, and styling
 * @param {ApiDocMetadataEntry} entry - The API metadata entry
 * @param {import('mdast').Heading} node - The heading node to transform
 * @param {number} index - The index of the node in its parent's children array
 * @param {import('unist').Parent} parent - The parent node containing the heading
 * @returns {[typeof SKIP]} Visitor instruction to skip the node
 */
const transformHeadingNode = (entry, node, index, parent) => {
  const { data } = node;
  const headerChildren = [
    createElement('div', [
      createElement(`h${data.depth}`, [
        createElement(
          `a#${data.slug}`,
          { href: `#${data.slug}` },
          sliceMarkdown(
            node,
            (findTextPositions(node, ':')[0] ?? -1) + 1,
            getTreeLength(node),
            { trimWhitespace: true }
          ).children
        ),
      ]),
    ]),
  ];

  // Add type icon if available
  if (data.type && data.type !== 'misc') {
    headerChildren[0].children.unshift(
      createJSXElement(JSX_IMPORTS.DataTag.name, {
        kind: data.type,
        size: 'sm',
      })
    );
  }

  // Add change history if available
  const changeElement = createChangeElement(entry);
  if (changeElement) {
    headerChildren[0].children.push(changeElement);
  }

  // Replace node with new heading and anchor
  parent.children[index] = createElement('div', headerChildren);

  // Add source link if available
  const sourceLink = createSourceLink(entry.source_link);
  if (sourceLink) {
    parent.children.splice(index + 1, 0, sourceLink);
  }

  return [SKIP];
};

/**
 * Processes an API documentation entry by applying transformations to its content
 * @param {ApiDocMetadataEntry} entry - The API metadata entry to process
 * @returns {import('unist').Node} The processed content
 */
const processEntry = entry => {
  // Create a copy to avoid modifying the original
  const content = structuredClone(entry.content);

  // Apply transformations
  visit(content, createQueries.UNIST.isStabilityNode, transformStabilityNode);
  visit(content, createQueries.UNIST.isHeading, (node, idx, parent) =>
    transformHeadingNode(entry, node, idx, parent)
  );

  return content;
};

/**
 * Creates the overall content structure with processed entries
 * @param {Array<ApiDocMetadataEntry>} entries - API documentation metadata entries
 * @param {Record<string, any>} sideBarProps - Props for the sidebar component
 * @param {Record<string, any>} metaBarProps - Props for the meta bar component
 * @returns {import('unist').Node} The root node of the content tree
 */
const createContentStructure = (entries, sideBarProps, metaBarProps) => {
  return createTree('root', [
    createJSXElement(JSX_IMPORTS.NavBar.name),
    createJSXElement(JSX_IMPORTS.Article.name, {
      children: [
        createJSXElement(JSX_IMPORTS.SideBar.name, sideBarProps),
        createElement('div', [
          createElement('main', entries.map(processEntry)),
          createJSXElement(JSX_IMPORTS.MetaBar.name, metaBarProps),
        ]),
      ],
    }),
  ]);
};

/**
 * @typedef {import('estree').Node & { data: ApiDocMetadataEntry }} JSXContent
 *
 * Transforms API metadata entries into processed MDX content
 * @param {Array<ApiDocMetadataEntry>} metadataEntries - API documentation metadata entries
 * @param {ApiDocMetadataEntry} head - Main API metadata entry with version information
 * @param {Object} sideBarProps - Props for the sidebar component
 * @param {import('unified').Processor} remark - Remark processor instance for markdown processing
 * @returns {JSXContent} The stringified MDX content
 */
const buildContent = (metadataEntries, head, sideBarProps, remark) => {
  const metaBarProps = buildMetaBarProps(head, metadataEntries);

  const root = createContentStructure(
    metadataEntries,
    sideBarProps,
    metaBarProps
  );

  const ast = remark.runSync(root);
  // ast => { Program: { Expression: { JSX } } }
  return {
    ...ast.body[0].expression,
    data: head,
  };
};

export default buildContent;
