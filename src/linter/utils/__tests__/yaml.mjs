import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import { describe, it } from 'node:test';

import { Scalar, Pair, YAMLSeq, YAMLMap } from 'yaml';

import { findPropertyByName, normalizeNode } from '../yaml.mjs';

describe('yaml', () => {
  describe('findPropertyByName', () => {
    it('should find a property by name when it exists', () => {
      const mockMap = {
        items: [
          new Pair(new Scalar('propertyA'), new Scalar('valueA')),
          new Pair(new Scalar('propertyB'), new Scalar('valueB')),
        ],
      };

      const result = findPropertyByName(mockMap, 'propertyA');

      strictEqual(result.key.value, 'propertyA');
      strictEqual(result.value.value, 'valueA');
    });

    it('should return undefined when property does not exist', () => {
      const mockMap = {
        items: [
          new Pair(new Scalar('propertyA'), new Scalar('valueA')),
          new Pair(new Scalar('propertyB'), new Scalar('valueB')),
        ],
      };

      const result = findPropertyByName(mockMap, 'nonExistent');
      strictEqual(result, undefined);
    });
  });

  describe('normalizeNode', () => {
    it('should normalize a scalar node', () => {
      const scalar = new Scalar('test-value');
      scalar.range = [0, 10, 10];

      const result = normalizeNode(scalar);

      deepStrictEqual(result, [
        {
          value: 'test-value',
          range: [0, 10, 10],
        },
      ]);
    });

    it('should normalize a sequence with scalar items', () => {
      const item1 = new Scalar('first');
      item1.range = [0, 5, 5];

      const item2 = new Scalar('second');
      item2.range = [6, 12, 12];

      const sequence = new YAMLSeq();
      sequence.items = [item1, item2];

      const result = normalizeNode(sequence);

      deepStrictEqual(result, [
        { value: 'first', range: [0, 5, 5] },
        { value: 'second', range: [6, 12, 12] },
      ]);
    });

    it('should normalize nested sequences', () => {
      const innerItem = new Scalar('nested');
      innerItem.range = [0, 6, 6];

      const innerSeq = new YAMLSeq();
      innerSeq.items = [innerItem];

      const outerItem = new Scalar('outer');
      outerItem.range = [6, 12, 12];

      const outerSeq = new YAMLSeq();
      outerSeq.items = [outerItem, innerSeq];

      const result = normalizeNode(outerSeq);

      deepStrictEqual(result, [
        { value: 'outer', range: [6, 12, 12] },
        { value: 'nested', range: [0, 6, 6] },
      ]);
    });

    it('should throw error for map nodes', () => {
      const mapNode = new YAMLMap();

      throws(() => normalizeNode(mapNode), {
        message: 'Unexpected node type: map',
      });
    });
  });
});
