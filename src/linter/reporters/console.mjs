'use strict';

import { styleText } from 'node:util';

/**
 * @type {Record<import('../types.d.ts').IssueLevel, string>}
 */
const levelToColorMap = {
  info: 'gray',
  warn: 'yellow',
  error: 'red',
};

/**
 * Console reporter
 *
 * @type {import('../types.d.ts').Reporter}
 */
export default issue => {
  const position = issue.location.position
    ? ` (${issue.location.position.start.line}:${issue.location.position.end.line})`
    : '';

  process.stdout.write(
    styleText(
      levelToColorMap[issue.level],
      `${issue.message} at ${issue.location.path}${position}`
    ) + '\n'
  );
};
