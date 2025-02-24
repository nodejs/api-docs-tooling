'use strict';

import reporters from './reporters/index.mjs';
import { invalidChangeVersion } from './rules/invalid-change-version.mjs';
import { missingChangeVersion } from './rules/missing-change-version.mjs';
import { missingIntroducedIn } from './rules/missing-introduced-in.mjs';

/**
 * Creates a linter instance to validate ApiDocMetadataEntry entries
 *
 * @param {boolean} dryRun Whether to run the linter in dry-run mode
 */
const createLinter = dryRun => {
  /**
   * Lint issues found during validations
   *
   * @type {Array<import('./types.d.ts').LintIssue>}
   */
  const issues = [];

  /**
   * Lint rules to validate the entries against
   *
   * @type {Array<import('./types.d.ts').LintRule>}
   */
  const rules = [
    missingIntroducedIn,
    missingChangeVersion,
    invalidChangeVersion,
  ];

  /**
   * Validates a ApiDocMetadataEntry entry against all defined rules
   *
   * @param {ApiDocMetadataEntry} entry
   * @returns {void}
   */
  const lint = entry => {
    for (const rule of rules) {
      const ruleIssues = rule(entry);

      if (ruleIssues.length > 0) {
        issues.push(...ruleIssues);
      }
    }
  };

  /**
   * Validates an array of ApiDocMetadataEntry entries against all defined rules
   *
   * @param {ApiDocMetadataEntry[]} entries
   * @returns {void}
   */
  const lintAll = entries => {
    for (const entry of entries) {
      lint(entry);
    }
  };

  /**
   * Reports found issues using the specified reporter
   *
   * @param {keyof typeof reporters} reporterName Reporter name
   * @returns {void}
   */
  const report = reporterName => {
    if (dryRun) {
      return;
    }

    const reporter = reporters[reporterName];

    for (const issue of issues) {
      reporter(issue);
    }
  };

  /**
   * Checks if any error-level issues were found during linting
   *
   * @returns {boolean}
   */
  const hasError = () => {
    return issues.some(issue => issue.level === 'error');
  };

  return {
    lintAll,
    report,
    hasError,
  };
};

export default createLinter;
