'use strict';

import { h as createElement } from 'hastscript';
import { u as createTree } from 'unist-builder';

/**
 * Generates the Stability Overview table based on the API metadata nodes.
 *
 * @param {Array<ApiDocMetadataEntry>} headMetadata The API metadata nodes to be used for the Stability Overview
 */
const buildStabilityOverview = headMetadata => {
  const headNodesWithStability = headMetadata.filter(entry =>
    Boolean(entry.stability.children.length)
  );

  const mappedHeadNodesIntoTable = headNodesWithStability.map(
    ({ heading, slug, stability }) => {
      // Retrieves the first Stability Index, as we only want to use the first one
      // to generate the Stability Overview
      const [{ data }] = stability.children;

      return createElement(
        'tr',
        createElement(
          'td.module_stability',
          createElement('a', { href: slug }, heading.data.name)
        ),
        createElement(
          `td.api_stability.api_stability_${data.index}`,
          // Grabs the first sentence of the description
          // to be used as a summary of the Stability Index
          `(${data.index}) ${data.description.split('. ')[0]}`
        )
      );
    }
  );

  return createElement(
    'table',
    createElement(
      'thead',
      createElement(
        'tr',
        createElement('th', 'API'),
        createElement('th', 'Stability')
      )
    ),
    createElement('tbody', mappedHeadNodesIntoTable)
  );
};

/**
 * Generates extra "special" HTML content basded on extra metadata that a node may have.
 *
 * @param {Array<ApiDocMetadataEntry>} headNodes The API metadata nodes to be used for the Stability Overview
 * @param {ApiDocMetadataEntry} node The current API metadata node to be transformed into HTML content
 */
export default (headNodes, node) => {
  return createTree('root', [
    node.tags.map(tag => {
      switch (tag) {
        case 'STABILITY_OVERVIEW_SLOT_BEGIN':
          return buildStabilityOverview(headNodes);
        case 'STABILITY_OVERVIEW_SLOT_END':
          return createTree('root');
        default:
          return createTree('root');
      }
    }),
  ]);
};
