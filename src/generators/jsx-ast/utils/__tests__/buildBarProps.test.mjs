import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SAMPLE } from './utils.mjs';
import { buildMetaBarProps } from '../buildBarProps.mjs';

describe('buildBarProps utilities', () => {
  describe('buildMetaBarProps', () => {
    it('should include expected fields', () => {
      const result = buildMetaBarProps(SAMPLE, [SAMPLE]);

      assert.equal(result.addedIn, 'v1.0.0');
      assert.deepEqual(result.viewAs, [
        ['JSON', 'sample-api.json'],
        ['MD', 'sample-api.md'],
      ]);
      assert.ok(result.readingTime.startsWith('1 min'));
      assert.ok(result.editThisPage.endsWith('sample-api.md'));
      assert.deepEqual(result.headings, [
        { depth: 2, value: 'SampleFunc', slug: 'sample-func' },
      ]);
    });
  });
});
