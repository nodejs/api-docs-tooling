// @ts-check
'use strict';

import reporters from './reporters/index.mjs';

/**
 *
 */
export class Linter {
  #_hasError = false;

  /**
   * @type {Array<import('./types.d.ts').LintMessage>}
   */
  #messages = [];

  /**
   *
   */
  get hasError() {
    return this.#_hasError;
  }

  /**
   * @param {import('./types.d.ts').LintMessage} msg
   */
  log(msg) {
    if (msg.level === 'error') {
      this.#_hasError = true;
    }

    this.#messages.push(msg);
  }

  /**
   * @param {keyof reporters} reporterName
   */
  report(reporterName) {
    const reporter = reporters[reporterName];

    for (const message of this.#messages) {
      reporter(message);
    }
  }

  /**
   * @param {string} msg
   * @param {import('./types.d.ts').LintMessageLocation | undefined} location
   */
  info(msg, location) {
    this.log({
      level: 'info',
      msg,
      location,
    });
  }

  /**
   * @param {string} msg
   * @param {import('./types.d.ts').LintMessageLocation | undefined} location
   */
  warn(msg, location) {
    this.log({
      level: 'warn',
      msg,
      location,
    });
  }

  /**
   * @param {string} msg
   * @param {import('./types.d.ts').LintMessageLocation | undefined} location
   */
  error(msg, location) {
    this.log({
      level: 'error',
      msg,
      location,
    });
  }
}
