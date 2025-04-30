import { LATEST_DOC_API_BASE_URL } from '../constants.mjs';

/**
 * Generates a list of introduction links for the llms.txt file
 *
 * @returns {string[]}
 */
export const getIntroLinks = () => {
  const aboutDocUrl = new URL('/api/documentation.md', LATEST_DOC_API_BASE_URL);
  const usageExamplesUrl = new URL('/api/synopsis.md', LATEST_DOC_API_BASE_URL);

  const introLinks = [
    `- [About this documentation](${aboutDocUrl})`,
    `- [Usage and examples](${usageExamplesUrl})`,
  ];

  return introLinks;
};
