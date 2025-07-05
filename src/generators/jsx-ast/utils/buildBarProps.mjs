import readingTime from 'reading-time';
import { visit } from 'unist-util-visit';

import { getFullName } from './createSignatureElements.mjs';
import { DOC_API_BLOB_EDIT_BASE_URL } from '../../../constants.mjs';
import {
  getCompatibleVersions,
  getVersionFromSemVer,
  getVersionURL,
} from '../../../utils/generators.mjs';

/**
 * Builds metadata for the sidebar and meta bar
 *
 * @param {ApiDocMetadataEntry} head - Main API metadata entry
 * @param {Array<ApiDocMetadataEntry>} entries - All API metadata entries
 */
export const buildMetaBarProps = (head, entries) => {
  // Extract text content for reading time calculation
  const textContent = entries.reduce((acc, entry) => {
    visit(entry.content, ['text', 'code'], node => {
      acc += node.value || '';
    });
    return acc;
  }, '');

  const headings = entries
    .filter(
      entry => entry.heading?.data?.text && entry.heading?.data?.depth < 3
    )
    .map(entry => {
      let heading = getFullName(
        entry.heading.data,
        entry.heading.data.name
          .replace(/`/g, '')
          .replace(/^[^:]+:/, '')
          .trim()
      );

      if (entry.heading.data.type === 'ctor') {
        heading += ' Constructor';
      }

      return {
        depth: entry.heading.depth,
        value: heading,
        slug: entry.heading.data.slug,
      };
    });

  return {
    headings,
    addedIn: head.introduced_in || head.added_in || '',
    readingTime: readingTime(textContent).text,
    viewAs: [
      ['JSON', `${head.api}.json`],
      ['MD', `${head.api}.md`],
    ],
    editThisPage: `${DOC_API_BLOB_EDIT_BASE_URL}${head.api}.md`,
  };
};

/**
 * Builds the sidebar properties for a given entry.
 * @param {ApiDocMetadataEntry} entry
 * @param {Array<ApiDocReleaseEntry>} releases
 * @param {import('semver').SemVer} version
 * @param {Array<[string, string]>} docPages
 */
export const buildSideBarProps = (entry, releases, version, docPages) => {
  const versions = getCompatibleVersions(entry.introduced_in, releases, true);

  return {
    versions: versions.map(({ version, isLts, isCurrent }) => {
      const parsed = getVersionFromSemVer(version);

      let label = `v${parsed}`;
      if (isLts) {
        label += ' (LTS)';
      }
      if (isCurrent) {
        label += ' (Current)';
      }

      return {
        value: getVersionURL(parsed, entry.api),
        label,
      };
    }),
    currentVersion: `v${version.version}`,
    pathname: `${entry.api}.html`,
    docPages,
  };
};
