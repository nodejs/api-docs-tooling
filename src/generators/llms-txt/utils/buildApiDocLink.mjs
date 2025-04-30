import { LATEST_DOC_API_BASE_URL } from '../../../constants.mjs';
import { transformNodeToString } from '../../../utils/unist.mjs';

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

  // Find the first paragraph in the content
  const descriptionNode = entry.content.children.find(
    child => child.type === 'paragraph'
  );

  if (!descriptionNode) {
    return link;
  }

  const description = transformNodeToString(descriptionNode)
    // Remove newlines and extra spaces
    .replace(/[\r\n]+/g, ' ');

  return `${link}: ${description}`;
};
