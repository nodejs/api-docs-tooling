import { styleText } from 'node:util';

import cliProgress from 'cli-progress';

/**
 *
 * @param {string} label
 * @returns {import('cli-progress').SingleBar}
 */
export function createProgressBar(label = '') {
  const format = ` ${styleText(['bold', 'green'], '{bar}')} | ${label} {percentage}% | {value}/{total}`;

  return new cliProgress.SingleBar({
    format,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
}
