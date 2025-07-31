import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Runs tests for a regex pattern
 * @param {RegExp} regex - The regex to test
 * @param {Array} testCases - Test cases with input, matches, and/or captures
 */
export const runRegexTests = async (regex, testCases) => {
  await describe(String(regex), async () => {
    for (const testCase of testCases) {
      await it(testCase.input, () => {
        // Get all matches for this test case
        const matches = getMatches(regex, testCase.input);

        // Check if matches meet expectations
        if ('matches' in testCase) {
          checkMatches(matches, testCase.matches);
        }

        // Check if capture groups meet expectations
        if ('captures' in testCase) {
          checkCaptures(matches, testCase.captures);
        }
      });
    }
  });
};

// Get all matches from input (handles global vs non-global regex)
const getMatches = (regex, input) => {
  if (regex.global) {
    return Array.from(input.matchAll(regex));
  }
  const match = input.match(regex);
  return match ? [match] : [];
};

// Validate that matches are what we expected
const checkMatches = (matches, expected) => {
  // Handle boolean expectation (just checking if it matches or not)
  if (typeof expected === 'boolean') {
    assert.equal(
      matches.length > 0,
      expected,
      `Expected ${expected ? 'at least one match' : 'no matches'}`
    );
    return;
  }

  // Handle array/string expectations (checking actual match values)
  const expectedArray = Array.isArray(expected) ? expected : [expected];

  assert.equal(matches.length, expectedArray.length, 'Wrong number of matches');

  expectedArray.forEach((exp, i) => {
    assert.equal(matches[i][0], exp, `Match ${i} incorrect`);
  });
};

// Validate that capture groups contain expected values
const checkCaptures = (matches, expected) => {
  // Normalize expected captures to nested array format
  const expectedArray =
    typeof expected === 'string'
      ? [[expected]]
      : Array.isArray(expected[0])
        ? expected
        : [expected];

  expectedArray.forEach((captureGroup, matchIndex) => {
    if (matchIndex < matches.length) {
      captureGroup.forEach((exp, captureIndex) => {
        // captureIndex + 1 because [0] is the full match, [1] is first capture group
        assert.equal(
          matches[matchIndex][captureIndex + 1],
          exp,
          `Capture ${captureIndex + 1} in match ${matchIndex} incorrect`
        );
      });
    }
  });
};

export default runRegexTests;
