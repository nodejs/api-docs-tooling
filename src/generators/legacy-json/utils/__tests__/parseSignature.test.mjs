import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import parseSignature, {
  parseDefaultValue,
  findParameter,
  parseParameters,
} from '../parseSignature.mjs';

describe('parseDefaultValue', () => {
  it('extracts default value', () => {
    const [name, defaultVal] = parseDefaultValue('param=default');
    assert.equal(name, 'param');
    assert.equal(defaultVal, '=default');
  });

  it('handles no default value', () => {
    const [name, defaultVal] = parseDefaultValue('param');
    assert.equal(name, 'param');
    assert.equal(defaultVal, undefined);
  });
});

describe('findParameter', () => {
  it('finds parameter by index', () => {
    const params = [{ name: 'first' }, { name: 'second' }];
    const result = findParameter('first', 0, params);
    assert.equal(result.name, 'first');
  });

  it('searches by name when index fails', () => {
    const params = [{ name: 'first' }, { name: 'second' }];
    const result = findParameter('second', 0, params);
    assert.equal(result.name, 'second');
  });

  it('finds in nested options', () => {
    const params = [
      {
        name: 'options',
        options: [{ name: 'nested' }],
      },
    ];
    const result = findParameter('nested', 0, params);
    assert.equal(result.name, 'nested');
  });

  it('returns default when not found', () => {
    const result = findParameter('missing', 0, []);
    assert.equal(result.name, 'missing');
  });
});

describe('parseParameters', () => {
  it('parses simple parameters', () => {
    const declared = ['param1', 'param2'];
    const markdown = [{ name: 'param1' }, { name: 'param2' }];
    const result = parseParameters(declared, markdown);

    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'param1');
    assert.equal(result[1].name, 'param2');
  });

  it('handles default values', () => {
    const declared = ['param=value'];
    const markdown = [{ name: 'param' }];
    const result = parseParameters(declared, markdown);

    assert.equal(result[0].default, '=value');
  });
});

describe('parseSignature', () => {
  it('returns empty signature for no parameters', () => {
    const result = parseSignature('`method()`', []);
    assert.deepEqual(result.params, []);
  });

  it('extracts return value', () => {
    const markdown = [{ name: 'return', type: 'string' }];
    const result = parseSignature('`method()`', markdown);

    assert.equal(result.return.name, 'return');
    assert.equal(result.return.type, 'string');
  });

  it('parses method with parameters', () => {
    const markdown = [{ name: 'param1' }, { name: 'param2' }];
    const result = parseSignature('`method(param1, param2)`', markdown);

    assert.equal(result.params.length, 2);
  });
});
