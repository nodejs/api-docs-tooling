'use strict';

import { unified } from 'unified';

import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

// Retrieves an instance of Remark configured to parse GFM (GitHub Flavored Markdown)
export const getRemark = () =>
  unified().use(remarkParse).use(remarkGfm).use(remarkStringify);
