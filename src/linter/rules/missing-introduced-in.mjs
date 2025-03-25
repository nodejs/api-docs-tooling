import { LINT_MESSAGES } from '../constants.mjs';

/**
 * Checks if `introduced_in` field is missing
 *
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingIntroducedIn = entries => {
  const issues = [];

  for (const entry of entries) {
    // Early continue if not a top-level heading or if introduced_in exists
    if (entry.heading.depth !== 1 || entry.introduced_in) continue;

    issues.push({
      level: 'info',
      message: LINT_MESSAGES.missingIntroducedIn,
      location: {
        path: entry.api_doc_source,
      },
    });
  }

  return issues;
};
