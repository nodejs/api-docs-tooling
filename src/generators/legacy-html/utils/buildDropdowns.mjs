'use strict';

import { coerce, gte } from 'semver';

import { getVersionFromSemVer } from '../../../utils/generators.mjs';

import {
  DOC_API_BASE_URL_VERSION,
  DOC_API_BLOB_EDIT_BASE_URL,
} from '../../../constants.mjs';

/**
 * Builds the Dropdown for the current Table of Contents
 *
 * @param {string} tableOfContents The stringified ToC
 */
const buildToC = tableOfContents =>
  `<li class="picker-header"><a href="#">` +
  `<span class="picker-arrow"></span>` +
  `Table of contents</a><div class="picker">` +
  `<div class="toc">${tableOfContents}</div></div></li>
`;

/**
 * Builds the Navigation Dropdown for the current file
 *
 * @param {string} navigationContents The stringified Navigation
 */
const buildNavigation = navigationContents =>
  `<li class="picker-header"><a href="#">` +
  `<span class="picker-arrow"></span>Index</a>` +
  `<div class="picker"><ul><li><a href="index.html">Index</a>` +
  `</li></ul><hr class="line" />${navigationContents}</div></li>`;

/**
 * Generates the dropdown for viewing the current API doc in different versions
 *
 * @param {string} api The current API node name
 * @param {string} added The version the API was added
 * @param {Array<ApiDocReleaseEntry>} versions All available Node.js releases
 */
const buildVersions = (api, added, versions) => {
  // All Node.js versions that support the current API; If there's no "introduced_at" field,
  // we simply show all versions, as we cannot pinpoint the exact version
  const compatibleVersions = versions.filter(({ version }) =>
    added ? gte(version, coerce(added), { loose: true }) : true
  );

  // Parses the SemVer version into something we use for URLs and to display the Node.js version
  // Then we create a `<li>` entry for said version, ensuring we link to the correct API doc
  const versionsAsList = compatibleVersions.map(({ version, isLts }) => {
    const parsedVersion = getVersionFromSemVer(version);

    const ltsLabel = isLts ? '<b>LTS</b>' : '';
    const linkToApi = `${DOC_API_BASE_URL_VERSION}${parsedVersion}/api/${api}.html`;

    return `<li><a href="${linkToApi}">${parsedVersion} ${ltsLabel}</a></li>`;
  });

  return (
    `<li class="picker-header"><a href="#">` +
    `<span class="picker-arrow"></span>Other versions</a>` +
    `<div class="picker"><ol id="alt-docs">${versionsAsList.join('')}</ol></div></li>`
  );
};

/**
 * Builds the "Edit on GitHub" link for the current API doc
 *
 * @param {string} api The current API node name
 */
const buildGitHub = api =>
  `<li class="edit_on_github">` +
  `<a href="${DOC_API_BLOB_EDIT_BASE_URL}${api}.md">` +
  `Edit on GitHub</a></li>`;

export default {
  buildToC,
  buildNavigation,
  buildVersions,
  buildGitHub,
};
