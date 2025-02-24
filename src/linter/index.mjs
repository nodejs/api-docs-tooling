'use strict';

import reporters from './reporters/index.mjs';
import { invalidChangeVersion } from './rules/invalid-change-version.mjs';
import { missingChangeVersion } from './rules/missing-change-version.mjs';
import { missingIntroducedIn } from './rules/missing-introduced-in.mjs';

/**
 * Lint issues in ApiDocMetadataEntry entries
 *
 * @param {boolean} dryRun Whether to run the linter in dry-run mode
 */
const createLinter = dryRun => {
  /**
   * @type {Array<import('./types.d.ts').LintIssue>}
   */
  const issues = [];

  /**
   * @type {Array<import('./types.d.ts').LintRule>}
   */
  const rules = [
    missingIntroducedIn,
    missingChangeVersion,
    invalidChangeVersion,
  ];

  /**
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
   * @param {ApiDocMetadataEntry[]} entries
   * @returns {void}
   */
  const lintAll = entries => {
    for (const entry of entries) {
      lint(entry);
    }
  };

  /**
   * @param {keyof reporters} reporterName
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
   * Returns whether there are any issues with a level of 'error'
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
