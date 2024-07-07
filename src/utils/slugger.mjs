'use strict';

import GitHubSlugger from 'github-slugger';

import { DOC_API_SLUGS_REPLACEMENTS } from '../constants.mjs';

/**
 * Creates a modified version of the GitHub Slugger
 *
 * @returns {InstanceType<typeof import('github-slugger').default>} The modified GitHub Slugger
 */
export const createNodeSlugger = () => {
  const slugger = new GitHubSlugger();

  return {
    /**
     * Creates a new slug based on the provided string
     *
     * @param {string} title The title to be parsed into a slug
     */
    slug: title => {
      // Applies certain string replacements that are specific
      // to the way how Node.js generates slugs/anchor IDs
      return DOC_API_SLUGS_REPLACEMENTS.reduce(
        (piece, { from, to }) => piece.replace(from, to),
        // Slugify the title using GitHub Slugger
        slugger.slug(title)
      );
    },

    /**
     * Resets the cache of the Slugger, preventing repeated slugs
     * to be marked as repeated.
     *
     * @returns {void}
     */
    reset: () => slugger.reset(),
  };
};
