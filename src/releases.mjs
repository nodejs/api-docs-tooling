'use strict';

import { readFile } from 'node:fs/promises';
import { coerce } from 'semver';

// A ReGeX for retrieving Node.js version headers from the CHANGELOG.md
const NODE_VERSIONS_REGEX = /\* \[Node\.js ([0-9.]+)\]\S+ (.*)\r?\n/g;

// A ReGeX for checking if a Node.js version is an LTS release
const NODE_LTS_VERSION_REGEX = /Long Term Support/i;

/**
 * Retrieves the Node.js CHANGELOG.md via a Network Request,
 * used when a non-file protocol is provided
 *
 * @param {URL} changelogUrl The URL to the CHANGELOG.md raw content
 */
const getChangelogFromNetwork = async changelogUrl =>
  fetch(changelogUrl).then(response => response.text());

/**
 * Retrieves the Node.js CHANGELOG.md via the File System,
 * used when a file protocol is provided
 *
 * @param {URL} changelogUrl The File Path to the CHANGELOG.md file
 */
const getChangelogFromFileSystem = async changelogUrl =>
  readFile(changelogUrl, 'utf-8');

/**
 * This creates an utility to retrieve the Node.js major release metadata
 * purely out from the Node.js CHANGELOG.md file
 *
 * @param {string} changelogPath The given URL to the Node.js CHANGELOG.md file
 */
const createNodeReleases = changelogPath => {
  const changelogUrl = new URL(changelogPath);

  const changelogStrategy =
    changelogUrl.protocol === 'https:'
      ? getChangelogFromNetwork(changelogUrl)
      : getChangelogFromFileSystem(changelogUrl);

  /**
   * Retrieves all Node.js major versions from the provided CHANGELOG.md file
   * and returns an array of objects containing the version and LTS status.
   *
   * @returns {Promise<Array<import('./types.d.ts').ApiDocReleaseEntry>>}
   */
  const getAllMajors = async () => {
    const changelog = await changelogStrategy;

    const nodeMajors = Array.from(changelog.matchAll(NODE_VERSIONS_REGEX));

    return nodeMajors.map(match => ({
      version: coerce(match[1]),
      isLts: NODE_LTS_VERSION_REGEX.test(match[2]),
    }));
  };

  return { getAllMajors };
};

export default createNodeReleases;
