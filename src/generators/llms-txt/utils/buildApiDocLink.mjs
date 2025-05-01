import { LATEST_DOC_API_BASE_URL } from '../../../constants.mjs';
import { transformNodeToString } from '../../../utils/unist.mjs';

/**
 * Retrieves the description of a given API doc entry. It first checks whether
 * the entry has a llm_description property. If not, it extracts the first
 * paragraph from the entry's content.
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {string}
 */
const getEntryDescription = entry => {
  if (entry.llm_description) {
    return entry.llm_description;
  }

  const descriptionNode = entry.content.children.find(
    child => child.type === 'paragraph'
  );

  if (!descriptionNode) {
    return '';
  }

  return (
    transformNodeToString(descriptionNode)
      // Remove newlines and extra spaces
      .replace(/[\r\n]+/g, '')
  );
};

/**
 * Builds a markdown link for an API doc entry
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {string}
 */
export const buildApiDocLink = entry => {
  const title = entry.heading.data.name;

  // Remove the leading doc/ from the path
  const path = entry.api_doc_source.replace(/^doc\//, '');
  const url = new URL(path, LATEST_DOC_API_BASE_URL);

  const link = `[${title}](${url})`;

  const description = getEntryDescription(entry);

  return `${link}: ${description}`;
};
