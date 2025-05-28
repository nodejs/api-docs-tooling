import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TAG_TRANSFORMS } from '../../constants.mjs';
import transformer from '../transformer.mjs';

const transform = transformer();

describe('transformer', () => {
  it('should transform element tag names', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'element', tagName: 'div', children: [] }],
    };

    transform(tree);

    assert.equal(tree.children[0].tagName, TAG_TRANSFORMS['div'] || 'div');
  });

  it('should preserve unknown tag names', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'element', tagName: 'unknown', children: [] }],
    };

    transform(tree);

    assert.equal(tree.children[0].tagName, 'unknown');
  });

  it('should move footnote section to proper location', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'div' },
        { type: 'element', tagName: 'nav' },
        {
          type: 'element',
          tagName: 'article',
          children: [
            { type: 'element', tagName: 'header' },
            {
              type: 'element',
              tagName: 'main',
              children: [{ type: 'element', tagName: 'div', children: [] }],
            },
          ],
        },
        {
          type: 'element',
          tagName: 'section',
          children: [{ type: 'element', tagName: 'footnote' }],
        },
      ],
    };

    transform(tree);

    assert.equal(tree.children.length, 3);

    const targetLocation = tree.children[2]?.children[1]?.children[0]?.children;
    assert.equal(targetLocation.length, 1);
    assert.equal(targetLocation[0].tagName, 'footnote');
  });

  it('should not move section if not at end', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'section', children: [] },
        { type: 'element', tagName: 'div', children: [] },
      ],
    };

    transform(tree);

    assert.equal(tree.children.length, 2);
    assert.equal(tree.children[0].tagName, 'section');
  });
});
