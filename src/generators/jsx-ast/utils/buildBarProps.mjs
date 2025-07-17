import readingTime from 'reading-time';
import { visit } from 'unist-util-visit';

import { getFullName } from './buildSignature.mjs';
import { DOC_API_BLOB_EDIT_BASE_URL } from '../../../constants.mjs';
import {
  getCompatibleVersions,
  getVersionFromSemVer,
  getVersionURL,
} from '../../../utils/generators.mjs';
import { TOC_MAX_HEADING_DEPTH } from '../constants.mjs';

/**
 * Generate a combined plain text string from all MDAST entries for estimating reading time.
 *
 * @param {Array<ApiDocMetadataEntry>} entries - API documentation entries
 */
export const extractTextContent = entries => {
  return entries.reduce((acc, entry) => {
    visit(entry.content, ['text', 'code'], node => {
      acc += node.value || '';
    });
    return acc;
  }, '');
};

/**
 * Determines if an entry should be included in the Table of Contents.
 * @param {ApiDocMetadataEntry} entry
 */
const shouldIncludeEntryInToC = ({ heading }) =>
  // Only include headings with text,
  heading?.data?.text.length &&
  // and whose depth <= the maximum allowed.
  heading?.data?.depth <= TOC_MAX_HEADING_DEPTH;

/**
 * Extracts and formats heading information from an API documentation entry.
 * @param {ApiDocMetadataEntry} entry
 */
const extractHeading = entry => {
  const data = entry.heading.data;

  const rawName = data.name
    // Remove any containing code blocks
    .replace(/`/g, '')
    // Remove any prefixes (i.e. 'Class:')
    .replace(/^[^:]+:/, '')
    // Trim the remaining whitespace
    .trim();

  let heading = getFullName(data, rawName);

  if (data.type === 'ctor') {
    heading += ' Constructor';
  }

  return {
    depth: entry.heading.depth,
    value: heading,
    slug: data.slug,
  };
};

/**
 * Build the list of heading metadata for sidebar navigation.
 *
 * @param {Array<ApiDocMetadataEntry>} entries - All API metadata entries
 */
export const extractHeadings = entries =>
  entries.filter(shouldIncludeEntryInToC).map(extractHeading);

/**
 * Builds metadata for the meta bar (right panel).
 *
 * @param {ApiDocMetadataEntry} head - Main API metadata entry (used as reference point)
 * @param {Array<ApiDocMetadataEntry>} entries - All documentation entries for a given API item
 */
export const buildMetaBarProps = (head, entries) => {
  return {
    headings: extractHeadings(entries),
    addedIn: head.introduced_in || head.added_in || '',
    readingTime: readingTime(extractTextContent(entries)).text,
    viewAs: [
      ['JSON', `${head.api}.json`],
      ['MD', `${head.api}.md`],
    ],
    editThisPage: `${DOC_API_BLOB_EDIT_BASE_URL}${head.api}.md`,
  };
};

/**
 * Converts a compatible version entry into a version label and link.
 *
 * @param {Array<ApiDocReleaseEntry>} compatibleVersions - Compatible versions
 * @param {string} api - API identifier (used in link)
 */
export const formatVersionOptions = (compatibleVersions, api) => {
  return compatibleVersions.map(({ version, isLts, isCurrent }) => {
    const parsed = getVersionFromSemVer(version);
    const value = getVersionURL(parsed, api);

    let label = `v${parsed}`;

    if (isLts) {
      label += ' (LTS)';
    }

    if (isCurrent) {
      label += ' (Current)';
    }

    return {
      value,
      label,
    };
  });
};

/**
 * Builds metadata for the sidebar (left panel).
 *
 * @param {ApiDocMetadataEntry} entry - Current documentation entry
 * @param {Array<ApiDocReleaseEntry>} releases - Available API releases
 * @param {import('semver').SemVer} version - Current SemVer version
 * @param {Array<[string, string]>} docPages - Available doc pages for sidebar navigation
 */
export const buildSideBarProps = (entry, releases, version, docPages) => {
  const compatibleVersions = getCompatibleVersions(
    entry.introduced_in,
    releases,
    true
  );

  return {
    versions: formatVersionOptions(compatibleVersions, entry.api),
    currentVersion: `v${version.version}`,
    pathname: `${entry.api}.html`,
    docPages,
  };
};
