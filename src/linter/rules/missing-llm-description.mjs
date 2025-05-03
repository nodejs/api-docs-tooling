import { LINT_MESSAGES } from '../constants.mjs';

/**
 * Checks if a top-level entry is missing a llm_description field or a paragraph
 * node.
 *
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {Array<import('../types.d.ts').LintIssue>}
 */
export const missingLlmDescription = entries => {
  return entries
    .filter(entry => {
      // Only process top-level headings
      if (entry.heading.depth !== 1) {
        return false;
      }

      // Skip entries that have an llm_description property
      if (entry.llm_description !== undefined) {
        return false;
      }

      const hasParagraph = entry.content.children.some(
        node => node.type === 'paragraph'
      );

      // Skip entries that contain a paragraph that can be used as a fallback.
      if (hasParagraph) {
        return false;
      }

      return true;
    })
    .map(entry => mapToMissingEntryWarning(entry));
};

/**
 * Maps a entry to a warning for missing llm description.
 *
 * @param {ApiDocMetadataEntry} entry
 * @returns {import('../types.d.ts').LintIssue}
 */
const mapToMissingEntryWarning = entry => ({
  level: 'warn',
  message: LINT_MESSAGES.missingLlmDescription,
  location: { path: entry.api_doc_source },
});
