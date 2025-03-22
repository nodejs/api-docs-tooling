import { describe, it } from 'node:test';
import github from '../../reporters/github.mjs';
import assert from 'node:assert';
import { errorIssue, infoIssue, warnIssue } from '../fixtures/issues.mjs';

describe('github', () => {
  it('should write to stdout with the correct fn based on the issue level', t => {
    t.mock.method(process.stdout, 'write');

    github(infoIssue);
    github(warnIssue);
    github(errorIssue);

    assert.strictEqual(process.stdout.write.mock.callCount(), 3);

    const callsArgs = process.stdout.write.mock.calls.map(call =>
      call.arguments[0].trim()
    );

    assert.deepStrictEqual(callsArgs, [
      '::notice file=doc/api/test.md::This is a INFO issue',
      '::warning file=doc/api/test.md,line=1,endLine=1::This is a WARN issue',
      '::error file=doc/api/test.md,line=1,endLine=1::This is a ERROR issue',
    ]);
  });
});
