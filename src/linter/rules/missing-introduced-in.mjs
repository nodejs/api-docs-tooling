import { LINT_MESSAGES } from '../constants.mjs';

/**
 * Checks if `introduced_in` node is missing
 *
 * @param {import('vfile').VFile} file
 * @param {import('mdast').Root} tree
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingIntroducedIn = (file, tree) => {
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
          path: file.path,
        },
      },
    ];
  }

  return [];
};
