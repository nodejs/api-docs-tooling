import { strictEqual, deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import GitHubSlugger from 'github-slugger';
import { VFile } from 'vfile';

import createMetadata from '../metadata.mjs';

describe('createMetadata', () => {
  it('should set the heading correctly', () => {
    const slugger = new GitHubSlugger();
    const metadata = createMetadata(slugger);
    const heading = {
      text: 'Test Heading',
      type: 'test',
      name: 'test',
      depth: 1,
    };
    metadata.setHeading(heading);
    strictEqual(metadata.create(new VFile(), {}).heading, heading);
  });

  it('should set the stability correctly', () => {
    const slugger = new GitHubSlugger();
    const metadata = createMetadata(slugger);
    const stability = 2;
    metadata.setStability(stability);
    strictEqual(metadata.create(new VFile(), {}).stability, stability);
  });

  it('should create a metadata entry correctly', () => {
    const slugger = new GitHubSlugger();
    const metadata = createMetadata(slugger);
    const apiDoc = new VFile({ path: 'test.md' });
    const section = { type: 'root', children: [] };
    const heading = {
      text: 'Test Heading',
      type: 'test',
      name: 'test',
      depth: 1,
    };
    const stability = 2;
    const properties = { source_link: 'test.com' };
    metadata.setHeading(heading);
    metadata.setStability(stability);
    metadata.updateProperties(properties);
    const expected = {
      api: 'test',
      slug: 'test.html#test-heading',
      sourceLink: 'test.com',
      updates: [],
      changes: [],
      heading,
      stability,
      content: section,
    };
    deepStrictEqual(metadata.create(apiDoc, section), expected);
  });
});
