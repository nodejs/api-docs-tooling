'use strict';

import { LINT_MESSAGES } from '../../constants.mjs';
import { buildHierarchy } from '../../utils/buildHierarchy.mjs';
import { DEPRECATION_HEADER_REGEX } from '../constants.mjs';
import getDeprecationEntries from './utils/getDeprecationEntries.mjs';

/**
 * @param {ApiDocMetadataEntry} deprecation
 * @param {number} expectedCode
 * @returns {Array<import('../types').LintIssue>}
 */
function lintDeprecation(deprecation, expectedCode) {
  // Try validating the header (`DEPXXXX: ...`) and extract the code for us to
  // look at
  const match = deprecation.heading.data.text.match(DEPRECATION_HEADER_REGEX);

  if (!match) {
    // Malformed header
    return [
      {
        level: 'error',
        location: {
          path: deprecation.api_doc_source,
          position: deprecation.yaml_position,
        },
        message: LINT_MESSAGES.malformedDeprecationHeader,
      },
    ];
  }

  const code = Number(match[1]);

  return code === expectedCode
    ? []
    : [
        {
          level: 'error',
          location: {
            path: deprecation.api_doc_source,
            position: deprecation.yaml_position,
          },
          message: LINT_MESSAGES.outOfOrderDeprecationCode
            .replaceAll('{{code}}', match[1])
            .replace('{{expectedCode}}', `${expectedCode}`.padStart(4, '0')),
        },
      ];
}

/**
 * Checks if any deprecation codes are out of order
 *
 * @type {import('../types').LintRule}
 */
export const deprecationCodeOrder = (entries, declarations) => {
  if (entries.length === 0 || entries[0].api !== 'deprecations') {
    // This is only relevant to doc/api/deprecations.md
    return [];
  }

  const issues = [];

  const hierarchy = buildHierarchy(entries);

  hierarchy.forEach(root => {
    const deprecations = getDeprecationEntries(root.hierarchyChildren);

    let expectedCode = 1;

    for (const deprecation of deprecations || []) {
      while (declarations.skipDeprecation.includes(expectedCode)) {
        expectedCode++;
      }

      issues.push(...lintDeprecation(deprecation, expectedCode));

      expectedCode++;
    }
  });

  return issues;
};
