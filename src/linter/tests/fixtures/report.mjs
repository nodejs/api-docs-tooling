/**
 * @type {import('../../types').ReportIssueProps}
 */
export const infoReport = {
  level: 'info',
  message: 'This is a INFO issue',
};

/**
 * @type {import('../../types').ReportIssueProps}
 */
export const warnReport = {
  level: 'warn',
  message: 'This is a WARN issue',
  position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
};

/**
 * @type {import('../../types').ReportIssueProps}
 */
export const errorReport = {
  level: 'error',
  message: 'This is a ERROR issue',
  position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
};
