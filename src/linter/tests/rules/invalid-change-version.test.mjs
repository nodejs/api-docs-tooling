import { describe, it } from 'node:test';
import { invalidChangeVersion } from '../../rules/invalid-change-version.mjs';
import { deepEqual, strictEqual } from 'node:assert';
import { assertEntry } from '../fixtures/entries.mjs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { execPath } from 'node:process';

describe('invalidChangeVersion', () => {
  it('should work with NODE_RELEASED_VERSIONS', () => {
    const result = spawnSync(
      execPath,
      [
        fileURLToPath(
          new URL(
            '../fixtures/invalidChangeVersion-environment.mjs',
            import.meta.url
          )
        ),
      ],
      {
        env: {
          NODE_RELEASED_VERSIONS: [
            'v9.9.0',
            'v13.9.0',
            'v12.16.2',
            'v15.0.0',
            'REPLACEME',
            'SOME_OTHER_RELEASED_VERSION',
          ].join(','),
        },
      }
    );

    strictEqual(result.status, 0);
    strictEqual(result.error, undefined);
  });

  it('should return an empty array if all change versions are valid', () => {
    deepEqual(invalidChangeVersion([assertEntry]), []);
  });

  it('should return an issue if a change version is invalid', () => {
    const issues = invalidChangeVersion([
      {
        ...assertEntry,
        changes: [
          ...assertEntry.changes,
          { version: ['v13.9.0', 'INVALID_VERSION'] },
        ],
      },
    ]);

    deepEqual(issues, [
      {
        level: 'error',
        location: {
          path: 'doc/api/assert.md',
          position: {
            start: { column: 1, line: 7, offset: 103 },
            end: { column: 35, line: 7, offset: 137 },
          },
        },
        message: 'Invalid version number: INVALID_VERSION',
      },
    ]);
  });
});
