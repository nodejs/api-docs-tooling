import createQueries from '../../utils/queries/index.mjs';
import { LINT_MESSAGES } from '../constants.mjs';
import { visit } from 'unist-util-visit';

/**
 * Checks if there are multiple stability nodes within a chain.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const duplicateStabilityNodes = context => {
  const issues = [];
  let currentDepth = 0;
  let currentStability = -1;
  let currentHeaderDepth = 0;

  visit(context.tree, node => {
    // Track the current header depth
    if (node.type === 'heading') {
      currentHeaderDepth = node.depth;
    }

    // Process blockquotes to find stability nodes
    if (node.type === 'blockquote') {
      if (node.children && node.children.length > 0) {
        const paragraph = node.children[0];
        if (
          paragraph.type === 'paragraph' &&
          paragraph.children &&
          paragraph.children.length > 0
        ) {
          const text = paragraph.children[0];
          if (text.type === 'text') {
            const match = text.value.match(
              createQueries.QUERIES.stabilityIndex
            );
            if (match) {
              const stability = parseFloat(match[1]);

              if (
                currentHeaderDepth > currentDepth &&
                stability >= 0 &&
                stability === currentStability
              ) {
                issues.push({
                  level: 'warn',
                  message: LINT_MESSAGES.duplicateStabilityNode,
                  position: node.position,
                });
              } else {
                currentDepth = currentHeaderDepth;
                currentStability = stability;
              }
            }
          }
        }
      }
    }
  });

  return issues;
};
