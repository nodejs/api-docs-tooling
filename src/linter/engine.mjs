'use strict';

/**
 * Creates a linter engine instance to validate ApiDocMetadataEntry entries
 *
 * @param {{
 * multiEntryRules: import('./types').MultipleEntriesLintRules[]
 * singleEntryRules: import('./types').SingleEntryLintRule[]
 * }} rules Lint rules to validate the entries against
 */
const createLinterEngine = ({ multiEntryRules, singleEntryRules }) => {
  /**
   * Validates a ApiDocMetadataEntry entry against all defined rules
   *
   * @param {ApiDocMetadataEntry} entry
   * @returns {import('./types').LintIssue[]}
   */
  const lint = entry => {
    const issues = [];

    for (const rule of singleEntryRules) {
      const ruleIssues = rule(entry);

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
   * @returns {import('./types').LintIssue[]}
   */
  const lintAll = entries => {
    const issues = [];

    for (const rule of multiEntryRules) {
      issues.push(...rule(entries));
    }

    for (const entry of entries) {
      issues.push(...lint(entry));
    }

    return issues;
  };

  return {
    lint,
    lintAll,
  };
};

export default createLinterEngine;
