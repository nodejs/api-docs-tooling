import { LINT_MESSAGES } from '../constants.mjs';
import { valid } from 'semver';
import { env } from 'node:process';

const NODE_RELEASED_VERSIONS = env.NODE_RELEASED_VERSIONS?.split(',');

/**
 * Checks if the given version is "REPLACEME" and the array length is 1.
 *
 * @param {string} version - The version to check.
 * @param {number} length - Length of the version array.
 * @returns {boolean} True if conditions match, otherwise false.
 */
const isValidReplaceMe = (version, length) =>
  length === 1 && version === 'REPLACEME';

/**
 * Determines if a given version is invalid.
 *
 * @param {string} version - The version to check.
 * @param {unknown} _ - Unused parameter.
 * @param {{ length: number }} context - Array containing the length property.
 * @returns {boolean} True if the version is invalid, otherwise false.
 */
const isInvalid = NODE_RELEASED_VERSIONS
  ? (version, _, { length }) =>
      !(
        isValidReplaceMe(version, length) ||
        NODE_RELEASED_VERSIONS.includes(version.replace(/^v/, ''))
      )
  : (version, _, { length }) =>
      !(isValidReplaceMe(version, length) || valid(version));

/**
 * Identifies invalid change versions from metadata entries.
 *
 * @param {ApiDocMetadataEntry[]} entries - Metadata entries to check.
 * @returns {import('../types').LintIssue[]} List of detected lint issues.
 */
export const invalidChangeVersion = entries =>
  entries.flatMap(({ changes, api_doc_source, yaml_position }) =>
    changes.flatMap(({ version }) =>
      (Array.isArray(version) ? version : [version])
        .filter(isInvalid)
        .map(version => ({
          level: 'error',
          message: LINT_MESSAGES.invalidChangeVersion.replace(
            '{{version}}',
            version
          ),
          location: { path: api_doc_source, position: yaml_position },
        }))
    )
  );
