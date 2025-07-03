import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { visit } from 'unist-util-visit';

import { SAMPLE } from './utils.mjs';
import { JSX_IMPORTS } from '../../../web/constants.mjs';
import buildContent from '../buildContent.mjs';

const expectedNames = [
  JSX_IMPORTS.NavBar.name,
  JSX_IMPORTS.Article.name,
  JSX_IMPORTS.SideBar.name,
];

describe('buildContent', () => {
  it('should process entries and include JSX wrapper elements', async () => {
    const tree = await buildContent(
      [SAMPLE],
      SAMPLE,
      {},
      {
        run: async x => ({ body: [{ expression: x }] }),
      }
    );

    const foundNames = [];
    visit(tree, node => node.name && foundNames.push(node.name));

    expectedNames.forEach(name => {
      assert(
        foundNames.includes(name),
        `Missing "${name}". Found: ${foundNames.join(', ')}`
      );
    });

    assert.equal(tree.data, SAMPLE);
  });
});
