'use strict';

import { getSortedHeadNodes } from '../../jsx-ast/utils/getSortedHeadNodes.mjs';
import { createSyntheticHead } from '../../jsx-ast/utils/synthetic/synthetic.mjs';

/**
 * Builds the `all.html` page from the module pages already generated.
 *
 * Its content is exactly the module pages' content, one after the other, so
 * nothing is rebuilt: the page program imports each module's `content` export
 * (see `buildPageProgram`) and the table of contents and reading time are the
 * modules' own, concatenated and summed. Chunk pages and the index are left
 * out, since the full module pages already carry their content.
 *
 * Modules are ordered as the sidebar lists them.
 *
 * @param {Array<import('../../jsx-ast/types').PageCode>} pages - Every generated page
 * @returns {import('../types').ComposedPage}
 */
export const buildAllPage = pages => {
  const byApi = new Map(pages.map(page => [page.data.api, page]));

  const parts = getSortedHeadNodes(
    pages
      .map(({ data }) => data)
      .filter(data => !data.synthetic && !data.chunk && data.api !== 'index')
  ).map(({ api }) => byApi.get(api));

  const minutes = parts.reduce(
    (sum, { readingTime }) => sum + (readingTime?.minutes ?? 0),
    0
  );

  return {
    data: createSyntheticHead('all', 'All'),
    headings: parts.flatMap(({ headings }) => headings),
    readingTime: parts.some(({ readingTime }) => readingTime)
      ? { text: `${Math.ceil(minutes)} min read`, minutes }
      : undefined,
    parts: parts.map(({ data }) => data.api),
  };
};
