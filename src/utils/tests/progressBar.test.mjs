import assert from 'node:assert';
import { describe, it } from 'node:test';

import cliProgress from 'cli-progress';

import {
  createProgressBar,
  startProgressBar,
  stopProgressBar,
} from '../progressBar.mjs';

describe('progressBar', () => {
  it('createProgressBar returns an instance of SingleBar', () => {
    const bar = createProgressBar();
    assert.ok(bar instanceof cliProgress.SingleBar);
  });

  it('startProgressBar sets the correct total value', () => {
    const bar = createProgressBar();
    startProgressBar(bar, 100);
    assert.strictEqual(bar.getTotal(), 100);
  });

  it('stopProgressBar stops the progress bar', () => {
    const bar = createProgressBar();
    startProgressBar(bar, 100);
    stopProgressBar(bar);
    assert.strictEqual(bar.isActive, false);
  });
});
