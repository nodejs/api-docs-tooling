/**
 * Checks if `introduced_in` field is missing in the API doc entry.
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingIntroducedIn = entry => {
  // Early return if not a top-level heading or if introduced_in exists
  if (entry.heading.depth !== 1 || entry.introduced_in) {
    return [];
  }

  return [
    {
      level: 'info',
      message: 'Missing `introduced_in` field in the API doc entry',
      location: {
        path: entry.api_doc_source,
        // line: entry.yaml_position.start,
        // column: entry.yaml_position.end,
      },
    },
  ];
};
