'use strict';

import { INTRDOCUED_IN_REGEX, LINT_MESSAGES } from '../constants.mjs';
import { findTopLevelEntry } from '../utils/find.mjs';

/**
 * Checks if `introduced_in` field is missing in the top-level entry.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const missingIntroducedIn = context => {
  const introducedIn = findTopLevelEntry(
    context.tree,
    node => node.type === 'html' && INTRDOCUED_IN_REGEX.test(node.value)
  );

  if (introducedIn) {
    return;
  }

  return context.report({
    level: 'info',
    message: LINT_MESSAGES.missingIntroducedIn,
  });
};
