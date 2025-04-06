import { invalidChangeVersion } from '../../rules/invalid-change-version.mjs';
import { deepEqual } from 'node:assert';
import { assertEntry } from './entries.mjs';

const issues = invalidChangeVersion([
  {
    ...assertEntry,
    changes: [
      ...assertEntry.changes,
      { version: ['SOME_OTHER_RELEASED_VERSION', 'v0.1.2'] },
    ],
  },
]);

deepEqual(issues, []);
