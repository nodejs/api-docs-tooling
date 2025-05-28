import readingTime from 'reading-time';
import { visit } from 'unist-util-visit';
import { DOC_API_BLOB_EDIT_BASE_URL } from '../../../constants.mjs';

/**
 * Builds sidebar navigation for API documentation pages
 *
 * @param {Map<string, Array<ApiDocMetadataEntry>>} groupedModules - Modules grouped by API
 * @param {Array<ApiDocMetadataEntry>} headNodes - Main entry nodes for each API
 */
export const buildSideBarDocPages = (groupedModules, headNodes) =>
  headNodes.map(node => {
    const moduleEntries = groupedModules.get(node.api);

    return {
      title: node.heading.data.name,
      doc: `${node.api}.html`,
      headings: moduleEntries
        .filter(entry => entry.heading?.data?.name && entry.heading.depth === 2)
        .map(entry => [entry.heading.data.name, `#${entry.heading.data.slug}`]),
    };
  });

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
    .filter(entry => entry.heading?.data?.name)
    .map(entry => ({
      depth: entry.heading.depth,
      value: entry.heading.data.name,
    }));

  return {
    headings,
    addedIn: head.introduced_in || head.added_in || '',
    readingTime: readingTime(textContent).text,
    viewAs: [['JSON', `${head.api}.json`]],
    editThisPage: `${DOC_API_BLOB_EDIT_BASE_URL}${head.api}.md`,
  };
};
