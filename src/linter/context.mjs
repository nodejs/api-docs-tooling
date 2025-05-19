'use strict';

/**
 * Creates a linting context for a given file and AST tree.
 *
 * @param {import('vfile').VFile} file
 * @param {import('mdast').Root} tree
 * @returns {import('./types').LintContext}
 */
const createContext = (file, tree) => {
  /**
   * Lint issues reported during validation.
   *
   * @type {import('./types').LintIssue[]}
   */
  const issues = [];

  /**
   * Reports a lint issue.
   *
   * @param {import('./types').ReportIssueProps} issue
   * @returns {void}
   */
  const report = ({ level, message, position }) => {
    /**
     * @type {import('./types').LintIssueLocation}
     */
    const location = {
      path: file.path,
    };

    if (position) {
      location.position = position;
    }

    issues.push({
      level,
      message,
      location,
    });
  };

  /**
   * Gets all reported issues.
   *
   * @returns {import('./types').LintIssue[]}
   */
  const getIssues = () => {
    return issues;
  };

  return {
    tree,
    report,
    getIssues,
  };
};

export default createContext;
