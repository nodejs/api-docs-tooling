import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import createPropertyTable, {
  classifyTypeNode,
  extractPropertyName,
  extractTypeAnnotations,
} from '../buildPropertyTable.mjs';

describe('classifyTypeNode', () => {
  it('identifies union separator', () => {
    const node = { type: 'text', value: ' | ' };
    assert.equal(classifyTypeNode(node), 2);
  });

  it('identifies type reference', () => {
    const node = {
      type: 'link',
      children: [{ type: 'inlineCode', value: '<string>' }],
    };
    assert.equal(classifyTypeNode(node), 1);
  });

  it('returns 0 for non-type nodes', () => {
    const node = { type: 'text', value: 'regular text' };
    assert.equal(classifyTypeNode(node), 0);
  });
});

describe('extractPropertyName', () => {
  it('extracts name from inlineCode', () => {
    const children = [{ type: 'inlineCode', value: 'propName ' }];
    const result = extractPropertyName(children);
    assert.equal(result.tagName, 'code');
    assert.equal(result.children[0].value, 'propName');
  });
});

describe('extractTypeAnnotations', () => {
  it('extracts type nodes until non-type node', () => {
    const children = [
      { type: 'link', children: [{ type: 'inlineCode', value: '<string>' }] },
      { type: 'text', value: ' | ' },
      { type: 'link', children: [{ type: 'inlineCode', value: '<number>' }] },
      { type: 'text', value: ' - description' },
    ];

    const result = extractTypeAnnotations(children);

    assert.equal(result.length, 3);
    assert.equal(children.length, 1); // Only non-type node left
    assert.equal(children[0].value, ' - description');
  });

  it('handles single type node', () => {
    const children = [
      { type: 'link', children: [{ type: 'inlineCode', value: '<string>' }] },
      { type: 'text', value: ' description' },
    ];

    const result = extractTypeAnnotations(children);

    assert.equal(result.length, 1);
    assert.equal(children.length, 1);
  });

  it('returns empty array for no type nodes', () => {
    const children = [{ type: 'text', value: 'just text' }];
    const result = extractTypeAnnotations(children);
    assert.equal(result.length, 0);
    assert.equal(children.length, 1);
  });
});

describe('createPropertyTable', () => {
  it('creates a table with headings by default', () => {
    const node = {
      children: [
        {
          children: [
            {
              children: [{ type: 'inlineCode', value: 'propName' }],
            },
          ],
        },
      ],
    };

    const result = createPropertyTable(node);

    assert.equal(result.tagName, 'table');
    assert.ok(result.children.find(child => child.tagName === 'thead'));
    assert.ok(result.children.find(child => child.tagName === 'tbody'));
  });

  it('creates a table without headings when specified', () => {
    const node = {
      children: [
        {
          children: [
            {
              children: [{ type: 'inlineCode', value: 'propName' }],
            },
          ],
        },
      ],
    };

    const result = createPropertyTable(node, false);

    assert.equal(result.tagName, 'table');
    assert.ok(!result.children.find(child => child.tagName === 'thead'));
  });
});
