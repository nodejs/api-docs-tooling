'use strict';

import createContext from './context.mjs';
import reporters from './reporters/index.mjs';

/**
 * Creates a linter instance to validate API documentation ASTs against a
 * defined set of rules.
 *
 * @param {import('./types').LintRule[]} rules - Lint rules to apply
 * @param {boolean} [dryRun] - If true, the linter runs without reporting
 * @returns {import('./types').Linter}
 */
const createLinter = (rules, dryRun = false) => {
  /**
   * Lint issues collected during validations.
   *
   * @type {Array<import('./types').LintIssue>}
   */
  const issues = [];

  /**
   * Lints a API doc and collects issues.
   *
   * @param {import('vfile').VFile} file
   * @param {import('mdast').Root} tree
   * @returns {void}
   */
  const lint = (file, tree) => {
    const context = createContext(file, tree);

    for (const rule of rules) {
      rule(context);
    }

    issues.push(...context.getIssues());
  };

  /**
   * Reports collected issues using the specified reporter.
   *
   * @param {keyof typeof reporters} [reporterName] Reporter name
   * @returns {void}
   */
  const report = (reporterName = 'console') => {
    if (dryRun) {
      return;
    }

    const reporter = reporters[reporterName];

    for (const issue of issues) {
      reporter(issue);
    }
  };

  /**
   * Checks if any error-level issues were collected.
   *
   * @returns {boolean}
   */
  const hasError = () => {
    return issues.some(issue => issue.level === 'error');
  };

  return {
    issues,
    lint,
    report,
    hasError,
  };
};

export default createLinter;
