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
  TYPES_WITH_METHOD_SIGNATURES,
} from '../constants.mjs';
import insertSignature, {
  createPropertyTable,
  getFullName,
} from './createSignatureElements.mjs';

/**
 * Creates a history of changes for an API element
 * @param {ApiDocMetadataEntry} entry - The metadata entry containing change information
 * @returns {import('unist').Node|null} JSX element representing change history or null if no changes
 */
const createChangeElement = entry => {
  const changeEntries = [
    // Process lifecycle changes (added, deprecated, etc.)
    ...Object.entries(LIFECYCLE_LABELS)
      .filter(([field]) => entry[field])
      .map(([field, label]) => ({
        versions: enforceArray(entry[field]),
        label: `${label}: ${enforceArray(entry[field]).join(', ')}`,
      })),

    // Process explicit changes if they exist
    ...(entry.changes?.map(change => ({
      versions: enforceArray(change.version),
      label: change.description,
      url: change['pr-url'],
    })) || []),
  ];

  if (!changeEntries.length) {
    return null;
  }

  // Sort by version, newest first and create the JSX element
  return createJSXElement(JSX_IMPORTS.ChangeHistory.name, {
    changes: sortChanges(changeEntries, 'versions').reverse(),
    className: 'change-history',
  });
};

/**
 * Creates a source link element if a source link is available
 * @param {string|undefined} sourceLink - The source link path
 * @returns {import('hastscript').Element|null} The source link element or null if no source link
 */
const createSourceLink = sourceLink =>
  sourceLink
    ? createElement('span', [
        INTERNATIONALIZABLE.sourceCode,
        createElement(
          'a',
          { href: `${DOC_NODE_BLOB_BASE_URL}${sourceLink}`, target: '_blank' },
          [
            sourceLink,
            createJSXElement(JSX_IMPORTS.ArrowUpRightIcon.name, {
              inline: true,
              className: 'arrow',
            }),
          ]
        ),
      ])
    : null;

/**
 * Creates a heading element with appropriate styling and metadata
 * @param {import('mdast').Node} content - The content node to extract text from
 * @param {import('unist').Node|null} changeElement - The change history element if available
 * @returns {import('hastscript').Element} The formatted heading element
 */
const createHeadingElement = (content, changeElement) => {
  const { type, depth, slug } = content.data;

  let headingContent =
    getFullName(content.data, false) ||
    sliceMarkdown(
      content,
      (findTextPositions(content, ':')[0] ?? -1) + 1,
      getTreeLength(content),
      { trimWhitespace: true }
    ).children;

  if (type === 'ctor') {
    headingContent += ' Constructor';
  }

  const headingWrapper = createElement('div', [
    createElement(`h${depth}`, [
      createElement(`a#${slug}`, { href: `#${slug}` }, headingContent),
    ]),
  ]);

  // Add type icon if available
  if (type && type !== 'misc') {
    headingWrapper.children.unshift(
      createJSXElement(JSX_IMPORTS.DataTag.name, { kind: type, size: 'sm' })
    );
  }

  // Add change history if available
  if (changeElement) {
    headingWrapper.children.push(changeElement);
  }

  return headingWrapper;
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
  const stabilityLevel = parseInt(node.data.index);

  parent.children[index] = createJSXElement(JSX_IMPORTS.AlertBox.name, {
    children: sliceMarkdown(node, start, getTreeLength(node), {
      trimWhitespace: true,
    }).children[0].children,
    level: STABILITY_LEVELS[stabilityLevel],
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
  // Replace node with new heading and anchor
  parent.children[index] = createHeadingElement(
    node,
    createChangeElement(entry)
  );

  // Add source link if available
  const sourceLink = createSourceLink(entry.source_link);
  if (sourceLink) {
    parent.children.splice(index + 1, 0, sourceLink);
  }

  // Add method signatures for appropriate types
  if (TYPES_WITH_METHOD_SIGNATURES.includes(node.data.type)) {
    insertSignature(parent, node, index + 1);
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
  visit(
    content,
    createQueries.UNIST.isTypedList,
    (node, idx, parent) => (parent.children[idx] = createPropertyTable(node))
  );

  return content;
};

/**
 * Creates the document layout with processed content, sidebar, and metadata
 * @param {Array<ApiDocMetadataEntry>} entries - API documentation metadata entries
 * @param {Record<string, any>} sideBarProps - Props for the sidebar component
 * @param {Record<string, any>} metaBarProps - Props for the meta bar component
 * @returns {import('unist').Node} The root node of the content tree
 */
const createDocumentLayout = (entries, sideBarProps, metaBarProps) => {
  return createTree('root', [
    createJSXElement(JSX_IMPORTS.NotificationProvider.name, {
      children: [
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
 * @returns {JSXContent} The processed MDX content
 */
const buildContent = async (metadataEntries, head, sideBarProps, remark) => {
  const metaBarProps = buildMetaBarProps(head, metadataEntries);

  const root = createDocumentLayout(
    metadataEntries,
    sideBarProps,
    metaBarProps
  );

  const ast = await remark.run(root);

  // ast => { Program: { Expression: { JSX } } }
  return {
    ...ast.body[0].expression,
    data: head,
  };
};

export default buildContent;
