/**
 * Checks if any change version is missing
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {Array<import('../types').LintIssue>}
 */
export const missingChangeVersion = entry => {
  if (entry.changes.length === 0) {
    return [];
  }

  return entry.changes
    .filter(change => !change.version)
    .map(() => ({
      level: 'warn',
      message: 'Missing change version',
      location: {
        path: entry.api_doc_source,
        line: entry.yaml_position.start.line,
        column: entry.yaml_position.start.column,
      },
    }));
};
