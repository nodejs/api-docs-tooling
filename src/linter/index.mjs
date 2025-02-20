'use strict';

import reporters from './reporters/index.mjs';
import { invalidChangeVersion } from './rules/invalid-change-version.mjs';
import { missingChangeVersion } from './rules/missing-change-version.mjs';
import { missingIntroducedIn } from './rules/missing-introduced-in.mjs';

/**
 * Lint issues in ApiDocMetadataEntry entries
 */
export class Linter {
  /**
   * @type {Array<import('./types.d.ts').LintIssue>}
   */
  #issues = [];

  /**
   * @type {Array<import('./types.d.ts').LintRule>}
   */
  #rules = [missingIntroducedIn, missingChangeVersion, invalidChangeVersion];

  /**
   * @param {ApiDocMetadataEntry} entry
   * @returns {void}
   */
  lint(entry) {
    for (const rule of this.#rules) {
      const issues = rule(entry);

      if (issues.length > 0) {
        this.#issues.push(...issues);
      }
    }
  }

  /**
   * @param {ApiDocMetadataEntry[]} entries
   * @returns {void}
   */
  lintAll(entries) {
    for (const entry of entries) {
      this.lint(entry);
    }
  }

  /**
   * @param {keyof reporters} reporterName
   */
  report(reporterName) {
    const reporter = reporters[reporterName];

    for (const issue of this.#issues) {
      reporter(issue);
    }
  }

  /**
   * Returns whether there are any issues with a level of 'error'
   *
   * @returns {boolean}
   */
  get hasError() {
    return this.#issues.some(issue => issue.level === 'error');
  }
}
