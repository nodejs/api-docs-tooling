/**
 * @type {import('../../types').LintIssue}
 */
export const infoIssue = {
  level: 'info',
  location: {
    path: 'doc/api/test.md',
    position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  },
  message: 'This is a INFO issue',
};

/**
 * @type {import('../../types').LintIssue}
 */
export const warnIssue = {
  level: 'warn',
  location: {
    path: 'doc/api/test.md',
    position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  },
  message: 'This is a WARN issue',
};

/**
 * @type {import('../../types').LintIssue}
 */
export const errorIssue = {
  level: 'error',
  location: {
    path: 'doc/api/test.md',
    position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  },
  message: 'This is a ERROR issue',
};
