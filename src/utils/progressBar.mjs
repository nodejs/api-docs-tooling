import { styleText } from 'node:util';

import cliProgress from 'cli-progress';

/**
 *
 * Create a progress bar instance
 * with our custom format
 *
 * @param {string} label
 * @returns {import('cli-progress').SingleBar}
 */
function createProgressBar(label = '') {
  const format = ` ${styleText(['bold', 'green'], '{bar}')} | ${label} {percentage}% | {value}/{total}`;

  return new cliProgress.SingleBar({
    format,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
}

export default createProgressBar;
