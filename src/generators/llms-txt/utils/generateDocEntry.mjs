import { transformNodeToString } from '../../../utils/unist.mjs';
import { ENTRY_IGNORE_LIST, LATEST_DOC_API_BASE_URL } from '../constants.mjs';

/**
 * Generates a documentation entry string
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {string}
 */
export function generateDocEntry(entry) {
  if (ENTRY_IGNORE_LIST.includes(entry.api_doc_source)) {
    return null;
  }

  if (entry.heading.depth !== 1) {
    return null;
  }

  // Remove the leading /doc of string
  const path = entry.api_doc_source.replace(/^doc\//, '');

  const entryLink = `[${entry.heading.data.name}](${LATEST_DOC_API_BASE_URL}/${path})`;

  const descriptionNode = entry.content.children.find(
    child => child.type === 'paragraph'
  );

  if (!descriptionNode) {
    console.warn(`No description found for entry: ${entry.api_doc_source}`);
    return `- ${entryLink}`;
  }

  const description = transformNodeToString(descriptionNode).replace(
    /[\r\n]+/g,
    ' '
  );

  return `- ${entryLink}: ${description}`;
}
