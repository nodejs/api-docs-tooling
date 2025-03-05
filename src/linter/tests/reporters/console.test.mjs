import { describe, it } from 'node:test';
import console from '../../reporters/console.mjs';
import assert from 'node:assert';
import { errorIssue, infoIssue, warnIssue } from '../fixtures/issues.mjs';

describe('console', () => {
  it('should write to stdout with the correct colors based on the issue level', t => {
    t.mock.method(process.stdout, 'write');

    console(infoIssue);
    console(warnIssue);
    console(errorIssue);

    assert.strictEqual(process.stdout.write.mock.callCount(), 3);

    const callsArgs = process.stdout.write.mock.calls.map(
      call => call.arguments[0]
    );

    assert.deepStrictEqual(callsArgs, [
      '\x1B[90mThis is a INFO issue at doc/api/test.md\x1B[39m\n',
      '\x1B[33mThis is a WARN issue at doc/api/test.md (1:1)\x1B[39m\n',
      '\x1B[31mThis is a ERROR issue at doc/api/test.md (1:1)\x1B[39m\n',
    ]);
  });
});
