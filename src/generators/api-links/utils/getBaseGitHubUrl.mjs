'use strict';

import { execSync } from 'node:child_process';

/**
 * @param {string} cwd
 */
export function getBaseGitHubUrl(cwd) {
  let url = execSync('git remote get-url origin', { cwd }).toString().trim();

  if (url.startsWith('git@')) {
    // It's an ssh url, we need to transform it to be https
    //  Ex/ git@github.com:nodejs/node.git -> https://github.com/nodejs/node.git
    let [, repository] = url.split(':');

    // Trim off the trailing .git if it exists
    if (repository.endsWith('.git')) {
      repository = repository.substring(0, repository.length - 4);
    }

    url = `https://github.com/${repository}`;
  }

  return url;
}

/**
 *
 * @param cwd
 */
export function getCurrentGitHash(cwd) {
  const hash = execSync('git rev-parse HEAD', { cwd }).toString().trim();

  return hash;
}
