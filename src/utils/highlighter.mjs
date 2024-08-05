'use strict';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { getSingletonHighlighterCore } from '@shikijs/core';

import shikiConfig from '../../shiki.config.mjs';

// Creates a Singleton instance for Shiki's syntax highlighter using WASM
const shikiHighlighter = await getSingletonHighlighterCore(shikiConfig);

// Creates a HAST transformer for Shiki which is used for transforming our codeboxes
const hastTransformer = rehypeShikiFromHighlighter(
  shikiHighlighter,
  shikiConfig
);

/**
 * Creates a HAST transformer for Shiki which is used for transforming our codeboxes
 *
 * @type {import('unified').Plugin}
 */
export default () => tree => hastTransformer(tree);
