'use strict';

import { find } from 'unist-util-find';
import { findBefore } from 'unist-util-find-before';

import {
  INTRODUCED_IN_REGEX,
  LINT_MESSAGES,
  llmDescription_REGEX,
} from '../constants.mjs';

/**
 * Finds the first node that matches the condition before the first h2 heading,
 * this area is considered the top-level section of the tree
 *
 * @param {import('mdast').Node} node
 * @param {import('unist-util-find').TestFn} condition
 */
const findTopLevelEntry = (node, condition) => {
  const h2 = find(node, { type: 'heading', depth: 2 });
  return h2 ? findBefore(node, h2, condition) : find(node, condition);
};

// Simplified metadata checks - llmDescription can fall back to paragraph
const METADATA_CHECKS = Object.freeze([
  {
    name: 'introducedIn',
    regex: INTRODUCED_IN_REGEX,
    level: 'info',
    message: LINT_MESSAGES.missingIntroducedIn,
  },
  {
    name: 'llmDescription',
    regex: llmDescription_REGEX,
    level: 'warn',
    message: LINT_MESSAGES.missingLlmDescription,
  },
]);

/**
 * Checks if required metadata fields are missing in the top-level entry.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const missingMetadata = context => {
  const foundMetadata = new Set();
  let hasParagraph = false;

  findTopLevelEntry(context.tree, node => {
    if (node.type === 'html') {
      for (const check of METADATA_CHECKS) {
        if (check.regex?.test(node.value)) {
          foundMetadata.add(check.name);
        }
      }
    } else if (node.type === 'paragraph') {
      hasParagraph = true;
    }
    return false; // Continue searching
  });

  // Report missing metadata
  for (const check of METADATA_CHECKS) {
    if (!foundMetadata.has(check.name)) {
      // The first paragraph can also be the LLM description.
      if (check.name === 'llmDescription' && hasParagraph) {
        continue;
      }

      context.report({
        level: check.level,
        message: check.message,
      });
    }
  }
};
