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

    url = `https://github.com/${repository}`;
  }

  // https://github.com/nodejs/node.git -> https://github.com/nodejs/node
  if (url.endsWith('.git')) {
    url = url.substring(0, url.length - 4);
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
