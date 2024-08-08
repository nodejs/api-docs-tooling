'use strict';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

// Retrieves an instance of Remark configured to parse GFM (GitHub Flavored Markdown)
export const getRemark = () => remark().use(remarkGfm);
