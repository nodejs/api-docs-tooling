'use strict';

import { unified } from 'unified';

import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';

import rehypeStringify from 'rehype-stringify';

import syntaxHighlighter from './highlighter.mjs';

// Retrieves an instance of Remark configured to parse GFM (GitHub Flavored Markdown)
export const getRemark = () =>
  unified().use(remarkParse).use(remarkGfm).use(remarkStringify);

// Retrieves an instance of Remark configured to output stringified HTML code
// including parsing Code Boxes with syntax highlighting
export const getRemarkRehype = () =>
  unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(syntaxHighlighter)
    .use(rehypeStringify, { allowDangerousHtml: true });
