'use strict';

import { coerce } from 'semver';

/**
 * Groups all the API metadata nodes by module (`api` property) so that we can process each different file
 * based on the module it belongs to.
 *
 * @param {Array<ApiDocMetadataEntry>} nodes The API metadata Nodes to be grouped
 */
export const groupNodesByModule = nodes => {
  /** @type {Map<string, Array<ApiDocMetadataEntry>>} */
  const groupedNodes = new Map();

  for (const node of nodes) {
    if (!groupedNodes.has(node.api)) {
      groupedNodes.set(node.api, []);
    }

    groupedNodes.get(node.api).push(node);
  }

  return groupedNodes;
};

/**
 * Parses the SemVer string into a Node.js-alike version
 *
 * @param {import('semver').SemVer} version The version to be parsed
 */
export const getVersionFromSemVer = version =>
  version.minor === 0
    ? `${version.major}.x`
    : `${version.major}.${version.minor}.x`;

/**
 * @TODO: This should not be necessary, and indicates errors within the API docs
 * @TODO: Hookup into a future Validation/Linting API
 *
 * This is a safe fallback to ensure that we always have a SemVer compatible version
 * even if the input is not a valid SemVer string
 *
 * @param {string|import('semver').SemVer} version SemVer compatible version (maybe)
 * @returns {import('semver').SemVer} SemVer compatible version
 */
export const coerceSemVer = version => {
  const coercedVersion = coerce(version);

  if (coercedVersion === null) {
    // @TODO: Linter to complain about invalid SemVer strings
    return coerce('0.0.0-REPLACEME');
  }

  return coercedVersion;
};
