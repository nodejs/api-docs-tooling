// @ts-check

'use strict';

import { styleText } from 'node:util';

/**
 * TODO is there a way to grab the parameter type for styleText since the types aren't exported
 * @type {Record<import('../types.d.ts').LintLevel, string>}
 */
const levelToColorMap = {
  info: 'gray',
  warn: 'yellow',
  error: 'red',
};

/**
 * @type {import('../types.d.ts').Reporter}
 */
export default msg => {
  console.log(styleText(levelToColorMap[msg.level], msg.msg));
};
