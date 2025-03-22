import { describe, it } from 'node:test';
import { invalidChangeVersion } from '../../rules/invalid-change-version.mjs';
import { deepEqual } from 'node:assert';
import { assertEntry } from '../fixtures/entries.mjs';

describe('invalidChangeVersion', () => {
  it('should return an empty array if all change versions are valid', () => {
    const issues = invalidChangeVersion([assertEntry]);

    deepEqual(issues, []);
  });

  it('should return an issue if a change version is invalid', () => {
    const issues = invalidChangeVersion([
      {
        ...assertEntry,
        changes: [
          ...assertEntry.changes,
          { version: ['v13.9.0', 'REPLACEME'] },
        ],
      },
    ]);

    deepEqual(issues, [
      {
        level: 'warn',
        location: {
          path: 'doc/api/assert.md',
          position: {
            end: {
              column: 35,
              line: 7,
              offset: 137,
            },
            start: {
              column: 1,
              line: 7,
              offset: 103,
            },
          },
        },
        message: 'Invalid version number: REPLACEME',
      },
    ]);
  });
});
