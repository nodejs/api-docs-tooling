import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSideBarDocPages,
  buildMetaBarProps,
} from '../utils/buildBarProps.mjs';
import buildContent from '../utils/buildContent.mjs';
import { createJSXElement } from '../utils/ast.mjs';
import { AST_NODE_TYPES } from '../constants.mjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

const sampleEntry = {
  api: 'sample-api',
  heading: {
    depth: 2,
    data: { name: 'SampleFunc', slug: 'sample-func', type: 'function' },
  },
  content: {
    type: 'root',
    children: [
      { type: 'text', value: 'Example text for testing reading time.' },
    ],
  },
  added_in: 'v1.0.0',
  source_link: '/src/index.js',
  changes: [
    {
      version: 'v1.1.0',
      description: 'Improved performance',
      'pr-url': 'https://github.com/org/repo/pull/123',
    },
  ],
};

test('buildSideBarDocPages returns expected format', () => {
  const grouped = new Map([['sample-api', [sampleEntry]]]);
  const result = buildSideBarDocPages(grouped, [sampleEntry]);

  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'SampleFunc');
  assert.equal(result[0].doc, 'sample-api.html');
  assert.deepEqual(result[0].headings, [['SampleFunc', '#sample-func']]);
});

test('buildMetaBarProps includes expected fields', () => {
  const result = buildMetaBarProps(sampleEntry, [sampleEntry]);

  assert.equal(result.addedIn, 'v1.0.0');
  assert.deepEqual(result.viewAs, [['JSON', 'sample-api.json']]);
  assert.ok(result.readingTime.startsWith('1 min'));
  assert.ok(result.editThisPage.endsWith('sample-api.md'));
  assert.deepEqual(result.headings, [{ depth: 2, value: 'SampleFunc' }]);
});

test('createJSXElement builds correct JSX tree', () => {
  const el = createJSXElement('TestComponent', {
    inline: false,
    children: 'Some content',
    dataAttr: { test: true },
  });

  assert.equal(el.type, AST_NODE_TYPES.MDX.JSX_BLOCK_ELEMENT);
  assert.equal(el.name, 'TestComponent');
  assert.ok(Array.isArray(el.children));
  assert.ok(el.attributes.some(attr => attr.name === 'dataAttr'));
});

test('buildContent processes entries and includes JSX wrapper elements', () => {
  const processor = unified().use(remarkParse).use(remarkStringify);
  const tree = buildContent([sampleEntry], sampleEntry, {}, processor);

  const article = tree.children.find(
    child => child.name === AST_NODE_TYPES.JSX.ARTICLE
  );
  assert.ok(article);
  assert.ok(article.children.some(c => c.name === AST_NODE_TYPES.JSX.SIDE_BAR));
  assert.ok(article.children.some(c => c.name === AST_NODE_TYPES.JSX.FOOTER));
});
