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

/**
 *
 * @param {import('cli-progress').SingleBar} bar
 * @param {number} total
 */
export function startProgressBar(bar, total) {
  bar.start(total, 0);
}

/**
 * @param {import('cli-progress').SingleBar} bar
 * @param {number} value
 */
export function updateProgressBar(bar, value = 1) {
  bar.update(value);
}

/**
 * @param {import('cli-progress').SingleBar} bar
 */
export function stopProgressBar(bar) {
  bar.stop();
}
