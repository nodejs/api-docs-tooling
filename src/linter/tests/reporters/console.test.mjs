import { describe, it } from 'node:test';
import assert from 'node:assert';
import reporter from '../../reporters/console.mjs';
import { errorIssue, infoIssue, warnIssue } from '../fixtures/issues.mjs';

const testCases = [
  {
    issue: infoIssue,
    method: 'info',
    expected: '\x1B[90mThis is a INFO issue at doc/api/test.md (1:1)\x1B[39m',
  },
  {
    issue: warnIssue,
    method: 'warn',
    expected: '\x1B[33mThis is a WARN issue at doc/api/test.md (1:1)\x1B[39m',
  },
  {
    issue: errorIssue,
    method: 'error',
    expected: '\x1B[31mThis is a ERROR issue at doc/api/test.md (1:1)\x1B[39m',
  },
];

describe('console', () => {
  testCases.forEach(({ issue, method, expected }) => {
    it(`should use correct colors and output on ${method} issues`, t => {
      t.mock.method(console, method);
      const mock = console[method].mock;

      reporter(issue);

      assert.strictEqual(mock.callCount(), 1);
      assert.deepStrictEqual(mock.calls[0].arguments, [expected]);
    });
  });
});
