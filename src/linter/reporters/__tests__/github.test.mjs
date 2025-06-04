import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  errorIssue,
  infoIssue,
  warnIssue,
} from '../../__tests__/fixtures/issues.mjs';
import github from '../github.mjs';

describe('github', () => {
  it('should write to stdout with the correct fn based on the issue level', t => {
    t.mock.method(process.stdout, 'write');

    github(infoIssue);
    github(warnIssue);
    github(errorIssue);

    assert.equal(process.stdout.write.mock.callCount(), 3);

    const callsArgs = process.stdout.write.mock.calls.map(call =>
      call.arguments[0].trim()
    );

    assert.deepEqual(callsArgs, [
      '::notice file=doc/api/test.md,line=1,endLine=1::This is a INFO issue',
      '::warning file=doc/api/test.md,line=1,endLine=1::This is a WARN issue',
      '::error file=doc/api/test.md,line=1,endLine=1::This is a ERROR issue',
    ]);
  });
});
