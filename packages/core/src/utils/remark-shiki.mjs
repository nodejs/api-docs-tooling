'use strict';

import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import syntaxHighlighter from './highlighter.mjs';
import { lazy } from './misc.mjs';
import { rehypeOptions } from './remark.mjs';

/**
 * Retrieves an instance of Remark configured to output stringified HTML code
 * including parsing Code Boxes with syntax highlighting.
 *
 * This lives apart from `./remark.mjs` because importing it loads Shiki (every
 * grammar plus the regex engine, ~250MB per process). Only the generators that
 * highlight code — `legacy-html` here — should pay for that.
 */
export const getRemarkRehypeWithShiki = lazy(() =>
  unified()
    .use(remarkParse)
    // legacy-html gets the minimal (unhighlighted) type rendering
    .use(remarkRehype, rehypeOptions)
    // This is a custom ad-hoc within the Shiki Rehype plugin, used to highlight code
    // and transform them into HAST nodes
    .use(syntaxHighlighter)
    .use(rehypeStringify, { allowDangerousHtml: true })
);
