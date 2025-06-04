import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SAMPLE } from './utils.mjs';
import { buildSideBarDocPages, buildMetaBarProps } from '../buildBarProps.mjs';

describe('buildBarProps utilities', () => {
  describe('buildSideBarDocPages', () => {
    it('should return expected format', () => {
      const grouped = new Map([['sample-api', [SAMPLE]]]);
      const result = buildSideBarDocPages(grouped, [SAMPLE]);

      assert.equal(result.length, 1);
      assert.equal(result[0].title, 'SampleFunc');
      assert.equal(result[0].doc, 'sample-api.html');
      assert.deepEqual(result[0].headings, [['SampleFunc', '#sample-func']]);
    });
  });

  describe('buildMetaBarProps', () => {
    it('should include expected fields', () => {
      const result = buildMetaBarProps(SAMPLE, [SAMPLE]);

      assert.equal(result.addedIn, 'v1.0.0');
      assert.deepEqual(result.viewAs, [['JSON', 'sample-api.json']]);
      assert.ok(result.readingTime.startsWith('1 min'));
      assert.ok(result.editThisPage.endsWith('sample-api.md'));
      assert.deepEqual(result.headings, [{ depth: 2, value: 'SampleFunc' }]);
    });
  });
});
