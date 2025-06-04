import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as issues from '../../__tests__/fixtures/issues.mjs';
import github from '../github.mjs';

describe('github', () => {
  it('should write to stdout with the correct fn based on the issue level', t => {
    t.mock.method(process.stdout, 'write');

    Object.values(issues).forEach(github);

    assert.equal(process.stdout.write.mock.callCount(), 3);

    const callsArgs = process.stdout.write.mock.calls.map(call =>
      call.arguments[0].trim()
    );

    assert.deepEqual(callsArgs, [
      '::error file=doc/api/test.md,line=1,endLine=1::This is a ERROR issue',
      '::notice file=doc/api/test.md,line=1,endLine=1::This is a INFO issue',
      '::warning file=doc/api/test.md,line=1,endLine=1::This is a WARN issue',
    ]);
  });
});
