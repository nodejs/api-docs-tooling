'use strict';

import { execSync } from 'child_process';

/**
 * Grabs the remote repository name in a directory
 *
 * @example getGitRepository('../node/lib') = 'nodejs/node'
 *
 * @param {string} directory Directory to check
 * @returns {string | undefined}
 */
export function getGitRepository(directory) {
  try {
    const trackingRemote = execSync(`cd ${directory} && git remote`);
    const remoteUrl = execSync(
      `cd ${directory} && git remote get-url ${trackingRemote}`
    );

    return (remoteUrl.match(/(\w+\/\w+)\.git\r?\n?$/) || [
      '',
      'nodejs/node',
    ])[1];
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return undefined;
  }
}

/**
 * Grabs the current tag or commit hash (if tag isn't present) ina directory
 *
 * @example getGitTag('../node/lib') = 'v20.0.0'
 *
 * @param {string} directory Directory to check
 * @returns {string | undefined}
 */
export function getGitTag(directory) {
  try {
    const hash =
      execSync(`cd ${directory} && git log -1 --pretty=%H`) || 'main';
    const tag =
      execSync(`cd ${directory} && git describe --contains ${hash}`).split(
        '\n'
      )[0] || hash;

    return tag;
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return undefined;
  }
}
