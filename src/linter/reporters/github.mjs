'use strict';

import * as core from '@actions/core';

const actions = {
  warn: core.warning,
  error: core.error,
  info: core.notice,
};

/**
 * GitHub action reporter for
 *
 * @type {import('../types.d.ts').Reporter}
 */
export default issue => {
  const logFn = actions[issue.level] || core.notice;

  logFn(issue.message, {
    file: issue.location.path,
    startLine: issue.location.position?.start.line,
    endLine: issue.location.position?.end.line,
  });
};
