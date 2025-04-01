'use strict';

/**
 * Creates a linter engine instance to validate mdast trees.
 *
 * @param {import('./types').LintRule[]} rules Lint rules to validate the entries against
 */
const createLinterEngine = rules => {
  /**
   * Validates an array of mdast trees against all defined rules
   *
   * @param {import('vfile').VFile} file
   * @param {import('mdast').Root[]} ast
   * @returns {import('./types').LintIssue[]}
   */
  const lint = (file, ast) => {
    const issues = [];

    for (const rule of rules) {
      issues.push(...rule(file, ast));
    }

    return issues;
  };

  return {
    lint,
  };
};

export default createLinterEngine;
