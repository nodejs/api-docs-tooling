import readingTime from 'reading-time';
import { visit } from 'unist-util-visit';

import { DOC_API_BLOB_EDIT_BASE_URL } from '../../../constants.mjs';

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
    .map(entry => ({
      depth: entry.heading.depth,
      value: entry.heading.data.text
        .replace(/`/g, '')
        .replace(/^[^:]+:/, '')
        .trim(),
      slug: entry.heading.data.slug,
    }));

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
