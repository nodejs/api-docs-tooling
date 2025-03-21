import { LINT_MESSAGES } from '../../constants.mjs';

/**
 * Checks if there are multiple stability nodes within a chain.
 *
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {Array<import('../types').LintIssue>}
 */
export const duplicateStabilityNodes = entries => {
  const issues = [];
  let currentDepth = 0;
  let currentStability = -1;

  for (const entry of entries) {
    const { depth } = entry.heading.data;
    const entryStability = entry.stability.children[0]?.data.index ?? -1;

    if (
      depth > currentDepth &&
      entryStability >= 0 &&
      entryStability === currentStability
    ) {
      issues.push({
        level: 'warn',
        message: LINT_MESSAGES.duplicateStabilityNode,
        location: {
          path: entry.api_doc_source,
          position: entry.yaml_position,
        },
      });
    } else {
      currentDepth = depth;
      currentStability = entryStability;
    }
  }

  return issues;
};
