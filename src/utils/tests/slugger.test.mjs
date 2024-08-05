import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { createNodeSlugger } from '../slugger.mjs';

describe('createNodeSlugger', () => {
  it('should create a new instance of the GitHub Slugger', () => {
    const slugger = createNodeSlugger();
    strictEqual(typeof slugger.slug, 'function');
    strictEqual(typeof slugger.reset, 'function');
  });

  it('should create a new slug based on the provided string', () => {
    const slugger = createNodeSlugger();
    strictEqual(slugger.slug('Test'), 'test');
  });

  it('should reset the cache of the Slugger', () => {
    const slugger = createNodeSlugger();
    slugger.reset();
  });
});
