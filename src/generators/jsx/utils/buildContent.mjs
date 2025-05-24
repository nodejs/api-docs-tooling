'use strict';

import { h as createElement } from 'hastscript';
import { u as createTree } from 'unist-builder';
import { SKIP, visit } from 'unist-util-visit';

import createQueries from '../../../utils/queries/index.mjs';
import { createJSXElement } from './ast.mjs';
import {
  ICON_SYMBOL_MAP,
  STABILITY_LEVELS,
  CHANGE_TYPES,
} from '../constants.mjs';
import { DOC_NODE_BLOB_BASE_URL } from '../../../constants.mjs';
import { enforceArray, sortChanges } from '../../../utils/generators.mjs';
import { buildMetaBarProps } from './buildBarProps.mjs';

/**
 * Transforms a stability node into an AlertBox JSX element
 *
 * @param {import('mdast').Blockquote} node - The stability node to transform
 * @param {number} index - The index of the node in its parent's children array
 * @param {import('unist').Parent} parent - The parent node containing the stability node
 * @returns {[typeof SKIP]} Visitor instruction to skip the node
 */
const transformStabilityNode = ({ data }, index, parent) => {
  parent.children[index] = createJSXElement('AlertBox', {
    children: data.description,
    level: STABILITY_LEVELS[data.index],
    title: data.index,
  });

  return [SKIP];
};

/**
 * Creates a history of changes for an API element
 *
 * @param {ApiDocMetadataEntry} entry - The metadata entry containing change information
 * @returns {import('unist').Node|null} JSX element representing change history or null if no changes
 */
const createChangeElement = entry => {
  // Collect changes from version fields (added, deprecated, etc.)
  const changeEntries = Object.entries(CHANGE_TYPES)
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
  return createJSXElement('ChangeHistory', {
    changes: sortChanges(changeEntries, 'versions'),
  });
};

/**
 * Creates a source link element if a source link is available
 *
 * @param {string|undefined} sourceLink - The source link path
 * @returns {import('hastscript').Element|null} The source link element or null if no source link
 */
const createSourceLink = sourceLink => {
  if (!sourceLink) {
    return null;
  }

  return createElement('span', [
    'Source Code: ',
    createElement(
      'a',
      { href: `${DOC_NODE_BLOB_BASE_URL}${sourceLink}` },
      sourceLink
    ),
  ]);
};

/**
 * Enhances a heading node with metadata, source links, and styling
 *
 * @param {ApiDocMetadataEntry} entry - The API metadata entry
 * @param {import('mdast').Heading} node - The heading node to transform
 * @param {number} index - The index of the node in its parent's children array
 * @param {import('unist').Parent} parent - The parent node containing the heading
 * @returns {[typeof SKIP]} Visitor instruction to skip the node
 */
const transformHeadingNode = (entry, node, index, parent) => {
  const { data, children } = node;
  const headerChildren = [
    createElement(`h${data.depth + 1}`, [
      createElement(`a.mark#${data.slug}`, { href: `#${data.slug}` }, children),
    ]),
  ];

  // Add type icon if available
  const iconSymbol = ICON_SYMBOL_MAP[data.type];
  if (iconSymbol) {
    headerChildren.unshift(createJSXElement('CircularIcon', iconSymbol));
  }

  // Add change history if available
  const changeElement = createChangeElement(entry);
  if (changeElement) {
    headerChildren.push(changeElement);
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
 *
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
 *
 * @param {Array<ApiDocMetadataEntry>} entries - API documentation metadata entries
 * @param {Object} sideBarProps - Props for the sidebar component
 * @param {Object} metaBarProps - Props for the meta bar component
 * @returns {import('unist').Node} The root node of the content tree
 */
const createContentStructure = (entries, sideBarProps, metaBarProps) => {
  return createTree('root', [
    createJSXElement('NavBar'),
    createJSXElement('Article', {
      children: [
        createJSXElement('SideBar', sideBarProps),
        createElement('div', [
          createElement('main', entries.map(processEntry)),
          createJSXElement('MetaBar', metaBarProps),
        ]),
        createJSXElement('Footer'),
      ],
    }),
  ]);
};

/**
 * Transforms API metadata entries into processed MDX content
 *
 * @param {Array<ApiDocMetadataEntry>} metadataEntries - API documentation metadata entries
 * @param {ApiDocMetadataEntry} head - Main API metadata entry with version information
 * @param {Object} sideBarProps - Props for the sidebar component
 * @param {import('unified').Processor} remark - Remark processor instance for markdown processing
 * @returns {string} The stringified MDX content
 */
const buildContent = (metadataEntries, head, sideBarProps, remark) => {
  const metaBarProps = buildMetaBarProps(head, metadataEntries);

  const root = createContentStructure(
    metadataEntries,
    sideBarProps,
    metaBarProps
  );

  return remark.runSync(root);
};

export default buildContent;
