import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AST_NODE_TYPES } from '../../constants.mjs';
import { createJSXElement } from '../ast.mjs';

describe('AST utilities', () => {
  it('should build correct JSX tree with createJSXElement', () => {
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
});
