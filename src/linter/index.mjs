'use strict';

import createLinterEngine from './engine.mjs';
import reporters from './reporters/index.mjs';
import rules from './rules/index.mjs';

/**
 * Creates a linter instance to validate ApiDocMetadataEntry entries
 *
 * @param {boolean} dryRun Whether to run the engine in dry-run mode
 * @param {string[]} disabledRules List of disabled rules names
 */
const createLinter = (dryRun, disabledRules) => {
  /**
   * Retrieves all enabled rules
   *
   * @returns {import('./types').LintRule[]}
   */
  const getEnabledRules = () => {
    return Object.entries(rules)
      .filter(([ruleName]) => !disabledRules.includes(ruleName))
      .map(([, rule]) => rule);
  };

  const engine = createLinterEngine(getEnabledRules(disabledRules));

  /**
   * Lint issues found during validations
   *
   * @type {Array<import('./types').LintIssue>}
   */
  const issues = [];

  /**
   * Lints all entries using the linter engine
   *
   * @param entries
   */
  const lintAll = entries => {
    issues.push(...engine.lintAll(entries));
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
