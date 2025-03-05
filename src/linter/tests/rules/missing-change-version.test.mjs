import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert';
import { missingChangeVersion } from '../../rules/missing-change-version.mjs';
import { assertEntry } from '../fixtures/entries.mjs';

describe('missingChangeVersion', () => {
  it('should return an empty array if all change versions are non-empty', () => {
    const issues = missingChangeVersion(assertEntry);

    deepEqual(issues, []);
  });

  it('should return an issue if a change version is missing', () => {
    const issues = missingChangeVersion({
      ...assertEntry,
      changes: [...assertEntry.changes, { version: undefined }],
    });

    deepEqual(issues, [
      {
        level: 'warn',
        location: {
          column: 1,
          line: 7,
          path: 'doc/api/assert.md',
        },
        message: 'Missing change version',
      },
    ]);
  });
});
