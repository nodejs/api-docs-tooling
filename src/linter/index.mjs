'use strict';

import { LINT_MESSAGES } from '../constants.mjs';
import createLinterEngine from './engine.mjs';
import reporters from './reporters/index.mjs';
import rules from './rules/index.mjs';

/**
 * Creates a linter instance to validate ApiDocMetadataEntry entries
 *
 * @param {boolean} dryRun Whether to run the engine in dry-run mode
 * @param {string[]} disabledRules List of disabled rules names
 */
const createLinter = (dryRun, disabledRules) => {
  /**
   * Retrieves all enabled rules
   *
   * @returns {import('./types').LintRule[]}
   */
  const getEnabledRules = () => {
    return Object.entries(rules)
      .filter(([ruleName]) => !disabledRules.includes(ruleName))
      .map(([, rule]) => rule);
  };

  /**
   * @type {import('./types').LintDeclarations}
   */
  const declarations = {
    skipDeprecation: [],
  };

  const engine = createLinterEngine(getEnabledRules(disabledRules));

  /**
   * Lint issues found during validations
   *
   * @type {Array<import('./types').LintIssue>}
   */
  const issues = [];

  /**
   * Lints all entries using the linter engine
   *
   * @param entries
   */
  const lintAll = entries => {
    issues.push(...engine.lintAll(entries, declarations));
  };

  /**
   * Reports found issues using the specified reporter
   *
   * @param {keyof typeof reporters} reporterName Reporter name
   * @returns {void}
   */
  const report = reporterName => {
    if (dryRun) {
      return;
    }

    const reporter = reporters[reporterName];

    for (const issue of issues) {
      reporter(issue);
    }
  };

  /**
   * Parse an inline-declaration found in the markdown input
   *
   * @param {string} declaration
   */
  const parseLinterDeclaration = declaration => {
    // Trim off any excess spaces from the beginning & end
    declaration = declaration.trim();

    // Extract the name for the declaration
    const [name, ...value] = declaration.split(' ');

    switch (name) {
      case 'skip-deprecation': {
        if (value.length !== 1) {
          issues.push({
            level: 'error',
            location: {
              // TODO,
              path: '',
              position: 0,
            },
            message: LINT_MESSAGES.malformedLinterDeclaration.replace(
              '{{message}}',
              `Expected 1 argument, got ${value.length}`
            ),
          });

          break;
        }

        // Get the deprecation code. This should be something like DEP0001.
        const deprecation = value[0];

        // Extract the number from the code
        const deprecationCode = Number(deprecation.substring('DEP'.length));

        // Make sure this is a valid deprecation code, output an error otherwise
        if (
          deprecation.length !== 7 ||
          !deprecation.startsWith('DEP') ||
          isNaN(deprecationCode)
        ) {
          issues.push({
            level: 'error',
            location: {
              // TODO,
              path: '',
              position: 0,
            },
            message: LINT_MESSAGES.malformedLinterDeclaration.replace(
              '{{message}}',
              `Invalid deprecation code ${deprecation}`
            ),
          });

          break;
        }

        declarations.skipDeprecation.push(deprecationCode);

        break;
      }
      default: {
        issues.push({
          level: 'error',
          location: {
            // TODO
            path: '',
            position: 0,
          },
          message: LINT_MESSAGES.invalidLinterDeclaration.replace(
            '{{declaration}}',
            name
          ),
        });
        break;
      }
    }
  };

  /**
   * Checks if any error-level issues were found during linting
   *
   * @returns {boolean}
   */
  const hasError = () => {
    return issues.some(issue => issue.level === 'error');
  };

  return {
    lintAll,
    report,
    parseLinterDeclaration,
    hasError,
  };
};

export default createLinter;
