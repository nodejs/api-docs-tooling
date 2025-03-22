'use strict';

/**
 * Creates a linter engine instance to validate ApiDocMetadataEntry entries
 *
 * @param {import('./types').LintRule[]} rules Lint rules to validate the entries against
 */
const createLinterEngine = rules => {
  /**
   * Validates an array of ApiDocMetadataEntry entries against all defined rules
   *
   * @param {ApiDocMetadataEntry[]} entries
   * @returns {import('./types').LintIssue[]}
   */
  const lintAll = entries => {
    const issues = [];

    for (const rule of rules) {
      issues.push(...rule(entries));
    }

    return issues;
  };

  return {
    lintAll,
  };
};

export default createLinterEngine;
