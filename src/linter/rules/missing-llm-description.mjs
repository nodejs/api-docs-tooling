import { LINT_MESSAGES, LLM_DESCRIPTION_REGEX } from '../constants.mjs';
import { findTopLevelEntry } from '../utils/find.mjs';

/**
 * Checks if a top-level entry is missing a llm_description field or a paragraph
 * node.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const missingLlmDescription = context => {
  const llmDescription = findTopLevelEntry(
    context.tree,
    node => node.type === 'html' && LLM_DESCRIPTION_REGEX.test(node.value)
  );

  if (llmDescription) {
    return;
  }

  // Check if there is a paragraph node in the top-level entry that can be used
  // as fallback for llm_description
  const paragraph = findTopLevelEntry(
    context.tree,
    node => node.type === 'paragraph'
  );

  if (paragraph) {
    return;
  }

  context.report({
    level: 'warn',
    message: LINT_MESSAGES.missingLlmDescription,
  });
};
