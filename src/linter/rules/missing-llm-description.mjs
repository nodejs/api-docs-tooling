import { LINT_MESSAGES } from '../constants.mjs';

/**
 * Checks if a top-level entry is missing a llm_description field or a paragraph
 * node.
 *
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingLlmDescription = entries => {
  const issues = [];

  for (const entry of entries) {
    if (entry.heading.depth !== 1 || entry.llm_description) {
      continue;
    }

    const descriptionNode = entry.content.children.find(
      child => child.type === 'paragraph'
    );

    if (!descriptionNode) {
      issues.push({
        level: 'warn',
        message: LINT_MESSAGES.missingLlmDescription,
        location: {
          path: entry.api_doc_source,
        },
      });
    }
  }

  return issues;
};
