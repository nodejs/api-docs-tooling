// @ts-check

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
 * @type {import('../types.d.ts').Reporter}
 */
export default issue => {
  const position = issue.location.position
    ? ` (${issue.location.position.start}:${issue.location.position.end})`
    : '';

  console.log(
    styleText(
      // @ts-expect-error ForegroundColors is not exported
      levelToColorMap[issue.level],
      `${issue.message} at ${issue.location.path}${position}`
    )
  );
};
