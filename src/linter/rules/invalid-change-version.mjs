import { LINT_MESSAGES } from '../constants.mjs';
import { valid } from 'semver';
import { env } from 'node:process';

const NODE_RELEASED_VERSIONS = env.NODE_RELEASED_VERSIONS?.split(',');

/**
 * Determines if a given version is invalid.
 *
 * @param {string} version - The version to check.
 * @returns {boolean} True if the version is invalid, false otherwise.
 */
const isInvalid = NODE_RELEASED_VERSIONS
  ? version =>
      version !== 'REPLACEME' && !NODE_RELEASED_VERSIONS.includes(version)
  : version => version !== 'REPLACEME' && !valid(version);

/**
 * Checks if any change version is invalid.
 *
 * @param {ApiDocMetadataEntry[]} entries - The metadata entries to check.
 * @returns {Array<import('../types').LintIssue>} List of lint issues found.
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
