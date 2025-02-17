// @ts-check

'use strict';

import * as core from '@actions/core';

/**
 * GitHub action reporter for
 *
 * @type {import('../types.d.ts').Reporter}
 */
export default issue => {
  const actions = {
    warn: core.warning,
    error: core.error,
    info: core.notice,
  };

  (actions[issue.level] || core.notice)(issue.message, {
    file: issue.location.path,
    startLine: issue.location.position.start.line,
    endLine: issue.location.position.end.line,
  });
};
