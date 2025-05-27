import { describe, mock, it } from 'node:test';
import assert from 'node:assert/strict';
import { VFile } from 'vfile';

import createLinter from '../index.mjs';
import { errorIssue, infoIssue, warnIssue } from './fixtures/issues.mjs';
import createContext from '../context.mjs';
import {
  errorDescriptor,
  infoDescriptor,
  warnDescriptor,
} from './fixtures/descriptors.mjs';
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

    const rule1Context = rule1.mock.calls[0].arguments[0];
    const rule2Context = rule2.mock.calls[0].arguments[0];

    assert.strictEqual(rule1Context.tree, emptyTree);
    assert.strictEqual(rule2Context.tree, emptyTree);
  });

  it('should return the aggregated issues from all rules', () => {
    const rule1 = mock.fn(ctx => {
      ctx.report(infoDescriptor);
      ctx.report(warnDescriptor);
    });

    const rule2 = mock.fn(ctx => ctx.report(errorDescriptor));

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
