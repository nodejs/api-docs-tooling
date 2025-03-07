import { LINT_MESSAGES } from '../../constants.mjs';
import { valid } from 'semver';

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
    version => valid(version) === null
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
