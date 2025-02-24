import { LINT_MESSAGES } from '../../constants.mjs';
import { validateVersion } from '../utils/semver.mjs';

/**
 * Checks if any change version is invalid
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {Array<import('../types').LintIssue>}
 */
export const invalidChangeVersion = entry => {
  if (entry.changes.length === 0) {
    return [];
  }

  const allVersions = entry.changes
    .filter(change => change.version)
    .flatMap(change =>
      Array.isArray(change.version) ? change.version : [change.version]
    );

  const invalidVersions = allVersions.filter(
    version => !validateVersion(version.substring(1)) // Trim the leading 'v' from the version string
  );

  return invalidVersions.map(version => ({
    level: 'warn',
    message: LINT_MESSAGES.invalidChangeVersion.replace('{{version}}', version),
    location: {
      path: entry.api_doc_source,
      position: entry.yaml_position,
    },
  }));
};
