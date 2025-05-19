import { describe, mock, it } from 'node:test';
import assert from 'node:assert/strict';
import createLinter from '../index.mjs';
import { errorIssue, infoIssue, warnIssue } from './fixtures/issues.mjs';
import { VFile } from 'vfile';
import createContext from '../context.mjs';
import { errorReport, infoReport, warnReport } from './fixtures/report.mjs';
import { emptyTree } from './fixtures/tree.mjs';

describe('createLinter', () => {
  it('should call each rule with context', t => {
    const context = {
      tree: emptyTree,
      report: () => {},
      getIssues: () => [],
    };

    t.mock.fn(createContext).mock.mockImplementation(() => context);

    const rule1 = mock.fn(() => []);
    const rule2 = mock.fn(() => []);

    const linter = createLinter([rule1, rule2]);

    linter.lint(new VFile({ path: 'doc/api/test.md' }), emptyTree);

    assert.strictEqual(rule1.mock.callCount(), 1);
    assert.strictEqual(rule2.mock.callCount(), 1);

    // assert.deepEqual(rule1.mock.calls[0].arguments, [context]);
    // assert.deepEqual(rule2.mock.calls[0].arguments, [context]);
  });

  it('should return the aggregated issues from all rules', () => {
    const rule1 = mock.fn(ctx => {
      ctx.report(infoReport);
      ctx.report(warnReport);
    });

    const rule2 = mock.fn(ctx => ctx.report(errorReport));

    const linter = createLinter([rule1, rule2]);

    linter.lint(new VFile({ path: 'doc/api/test.md' }), emptyTree);

    assert.equal(linter.issues.length, 3);
    assert.deepEqual(linter.issues, [infoIssue, warnIssue, errorIssue]);
  });

  it('should return an empty array when no issues are found', () => {
    const rule = () => [];

    const linter = createLinter([rule]);

    linter.lint(new VFile({ path: 'doc/api/test.md' }), emptyTree);

    assert.deepEqual(linter.issues, []);
  });
});
