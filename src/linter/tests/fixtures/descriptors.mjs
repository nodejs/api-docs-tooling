/**
 * @type {import('../../types').IssueDescriptor}
 */
export const infoDescriptor = {
  level: 'info',
  message: 'This is a INFO issue',
};

/**
 * @type {import('../../types').IssueDescriptor}
 */
export const warnDescriptor = {
  level: 'warn',
  message: 'This is a WARN issue',
  position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
};

/**
 * @type {import('../../types').IssueDescriptor}
 */
export const errorDescriptor = {
  level: 'error',
  message: 'This is a ERROR issue',
  position: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
};
