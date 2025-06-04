import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { SAMPLE } from './utils.mjs';
import { AST_NODE_TYPES } from '../../constants.mjs';
import buildContent from '../buildContent.mjs';

describe('buildContent', () => {
  it('should process entries and include JSX wrapper elements', () => {
    const processor = unified().use(remarkParse).use(remarkStringify);
    const tree = buildContent([SAMPLE], SAMPLE, {}, processor);

    const article = tree.children.find(
      child => child.name === AST_NODE_TYPES.JSX.ARTICLE
    );
    assert.ok(article);
    assert.ok(
      article.children.some(c => c.name === AST_NODE_TYPES.JSX.SIDE_BAR)
    );
    assert.ok(article.children.some(c => c.name === AST_NODE_TYPES.JSX.FOOTER));
  });
});
