import assert from 'node:assert';
import { test } from 'node:test';

import cliProgress from 'cli-progress';

import createProgressBar from '../progressBar.mjs';

/**
 * Simple test to unsure that the progress bar is created
 * and we assume that it's work with ou style
 */
test('createProgressBar returns an instance of SingleBar', () => {
  const bar = createProgressBar();
  assert.ok(bar instanceof cliProgress.SingleBar);
});
