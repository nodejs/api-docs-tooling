import { describe, mock, it } from 'node:test';
import assert from 'node:assert/strict';
import createLinterEngine from '../engine.mjs';
import { assertEntry } from './fixtures/entries.mjs';
import { errorIssue, infoIssue, warnIssue } from './fixtures/issues.mjs';

describe('createLinterEngine', () => {
  it('should call each rule with the provided entry', () => {
    const rule1 = mock.fn(() => []);
    const rule2 = mock.fn(() => []);

    const engine = createLinterEngine([rule1, rule2]);

    engine.lintAll([assertEntry]);

    assert.strictEqual(rule1.mock.callCount(), 1);
    assert.strictEqual(rule2.mock.callCount(), 1);

    assert.deepEqual(rule1.mock.calls[0].arguments, [[assertEntry]]);
    assert.deepEqual(rule2.mock.calls[0].arguments, [[assertEntry]]);
  });

  it('should return the aggregated issues from all rules', () => {
    const rule1 = mock.fn(() => [infoIssue, warnIssue]);
    const rule2 = mock.fn(() => [errorIssue]);

    const engine = createLinterEngine([rule1, rule2]);

    const issues = engine.lintAll([assertEntry]);

    assert.equal(issues.length, 3);
    assert.deepEqual(issues, [infoIssue, warnIssue, errorIssue]);
  });

  it('should return an empty array when no issues are found', () => {
    const rule = () => [];

    const engine = createLinterEngine([rule]);

    const issues = engine.lintAll([assertEntry]);

    assert.deepEqual(issues, []);
  });
});
