import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SAMPLE } from './utils.mjs';
import { JSX_IMPORTS } from '../../../web/constants.mjs';
import buildContent from '../buildContent.mjs';

describe('buildContent', () => {
  it('should process entries and include JSX wrapper elements', () => {
    const tree = buildContent(
      [SAMPLE],
      SAMPLE,
      {},
      {
        runSync: x => ({
          body: [{ expression: x }],
        }),
      }
    );

    assert.deepStrictEqual(
      tree.children.map(child => child.name),
      [JSX_IMPORTS.NavBar.name, JSX_IMPORTS.Article.name]
    );
    assert.equal(tree.data, SAMPLE);
  });
});
