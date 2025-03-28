import { LINT_MESSAGES } from '../constants.mjs';

/**
 * Checks if `introduced_in` node is missing
 *
 * @param {import('mdast').Root} tree
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingIntroducedIn = tree => {
  const regex = /<!--introduced_in=.*-->/;

  const introduced_in = tree.children.find(
    node => node.type === 'html' && regex.test(node.value)
  );

  if (!introduced_in) {
    return [
      {
        level: 'info',
        message: LINT_MESSAGES.missingIntroducedIn,
        location: {
          path: '?',
          position: {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 },
          },
        },
      },
    ];
  }

  return [];
};
