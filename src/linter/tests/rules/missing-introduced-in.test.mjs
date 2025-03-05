import { describe, it } from 'node:test';
import { missingIntroducedIn } from '../../rules/missing-introduced-in.mjs';
import { deepEqual } from 'assert';
import { assertEntry } from '../fixtures/entries.mjs';

describe('missingIntroducedIn', () => {
  it('should return an empty array if the introduced_in field is not missing', () => {
    const issues = missingIntroducedIn(assertEntry);

    deepEqual(issues, []);
  });

  it('should return an empty array if the heading depth is not equal to 1', () => {
    const issues = missingIntroducedIn({
      ...assertEntry,
      heading: { ...assertEntry.heading, depth: 2 },
    });

    deepEqual(issues, []);
  });

  it('should return an issue if the introduced_in property is missing', () => {
    const issues = missingIntroducedIn({
      ...assertEntry,
      introduced_in: undefined,
    });

    deepEqual(issues, [
      {
        level: 'info',
        location: {
          path: 'doc/api/assert.md',
        },
        message: "Missing 'introduced_in' field in the API doc entry",
      },
    ]);
  });
});
