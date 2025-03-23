'use strict';

/**
 * Creates a linter engine instance to validate ApiDocMetadataEntry entries
 *
 * @param {import('./types').LintRule} rules Lint rules to validate the entries against
 */
const createLinterEngine = rules => {
  /**
   * Validates a ApiDocMetadataEntry entry against all defined rules
   *
   * @param {ApiDocMetadataEntry} entry
   * @param {import('./types').LintDeclarations}
   * @param declarations
   * @returns {import('./types').LintIssue[]}
   */
  const lint = (entry, declarations) => {
    const issues = [];

    for (const rule of rules) {
      const ruleIssues = rule([entry], declarations);

      if (ruleIssues.length > 0) {
        issues.push(...ruleIssues);
      }
    }

    return issues;
  };

  /**
   * Validates an array of ApiDocMetadataEntry entries against all defined rules
   *
   * @param {ApiDocMetadataEntry[]} entries
   * @param {import('./types').LintDeclarations}
   * @param declarations
   * @returns {import('./types').LintIssue[]}
   */
  const lintAll = (entries, declarations) => {
    const issues = [];

    for (const rule of rules) {
      const ruleIssues = rule(entries, declarations);

      if (ruleIssues.length > 0) {
        issues.push(...ruleIssues);
      }
    }

    return issues;
  };

  return {
    lint,
    lintAll,
  };
};

export default createLinterEngine;
