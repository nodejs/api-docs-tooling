'use strict';

import { unified } from 'unified';

import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';

import rehypeRecma from 'rehype-recma';
import rehypeStringify from 'rehype-stringify';

import recmaJsx from 'recma-jsx';

import syntaxHighlighter from './highlighter.mjs';
import transformElements from '../generators/jsx/utils/transformer.mjs';
import { AST_NODE_TYPES } from '../generators/jsx/constants.mjs';
import rehypeShikiji from '@node-core/rehype-shiki';

/**
 * Retrieves an instance of Remark configured to parse GFM (GitHub Flavored Markdown)
 */
export const getRemark = () =>
  unified().use(remarkParse).use(remarkGfm).use(remarkStringify);

/**
 * Retrieves an instance of Remark configured to output stringified HTML code
 * including parsing Code Boxes with syntax highlighting
 */
export const getRemarkRehype = () =>
  unified()
    .use(remarkParse)
    // We make Rehype ignore existing HTML nodes (just the node itself, not its children)
    // as these are nodes we manually created during the rehype process
    // We also allow dangerous HTML to be passed through, since we have HTML within our Markdown
    // and we trust the sources of the Markdown files
    .use(remarkRehype, { allowDangerousHtml: true, passThrough: ['element'] })
    // This is a custom ad-hoc within the Shiki Rehype plugin, used to highlight code
    // and transform them into HAST nodes
    // @TODO: Get rid of @shikijis/rehype and use our own Rehype plugin for Shiki
    // since we have CJS/ESM nodes. (Base off from the nodejs/nodejs.org repository)
    .use(syntaxHighlighter)
    // We allow dangerous HTML to be passed through, since we have HTML within our Markdown
    // and we trust the sources of the Markdown files
    .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Retrieves an instance of Remark configured to output JSX code.
 * including parsing Code Boxes with syntax highlighting
 */
export const getRemarkRecma = () =>
  unified()
    .use(remarkParse)
    // We make Rehype ignore existing HTML nodes, and JSX nodes
    // as these are nodes we manually created during the generation process
    // We also allow dangerous HTML to be passed through, since we have HTML within our Markdown
    // and we trust the sources of the Markdown files
    .use(remarkRehype, {
      allowDangerousHtml: true,
      passThrough: ['element', ...Object.values(AST_NODE_TYPES.MDX)],
    })
    .use(rehypeShikiji)
    .use(transformElements)
    .use(rehypeRecma)
    .use(recmaJsx);
