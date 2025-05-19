'use strict';

import { LINT_MESSAGES } from '../constants.mjs';
import { findTopLevelEntry } from '../utils/find.mjs';

const regex = /<!--introduced_in=.*-->/;

/**
 * Checks if `introduced_in` field is missing in the top-level entry.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const missingIntroducedIn = context => {
  const introducedIn = findTopLevelEntry(
    context.tree,
    node => node.type === 'html' && regex.test(node.value)
  );

  if (introducedIn) {
    return;
  }

  return context.report({
    level: 'info',
    message: LINT_MESSAGES.missingIntroducedIn,
  });
};
