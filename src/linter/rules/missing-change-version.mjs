/**
 * Checks if any change version is missing
 *
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {Array<import('../types').LintIssue>}
 */
export const missingChangeVersion = entries => {
  const issues = [];

  for (const entry of entries) {
    if (entry.changes.length === 0) continue;

    issues.push(
      ...entry.changes
        .filter(change => !change.version)
        .map(() => ({
          level: 'warn',
          message: 'Missing change version',
          location: {
            path: entry.api_doc_source,
            position: entry.yaml_position,
          },
        }))
    );
  }

  return issues;
};
