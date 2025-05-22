'use strict';

import rules from '../rules/index.mjs';

/**
 * Gets all enabled rules
 *
 * @param {string[]} [disabledRules] - List of disabled rule names
 * @returns {import('../types').LintRule[]} - List of enabled rules
 */
export const getEnabledRules = (disabledRules = []) => {
  return Object.entries(rules)
    .filter(([ruleName]) => !disabledRules.includes(ruleName))
    .map(([, rule]) => rule);
};
