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
    metadata.addStability(stability);
    const actual = metadata.create(new VFile(), {}).stability;
    delete actual.toJSON;
    deepStrictEqual(actual, {
      children: [stability],
      type: 'root',
    });
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
    metadata.addStability(stability);
    metadata.updateProperties(properties);
    const expected = {
      api: 'test',
      slug: 'test.html#test-heading',
      sourceLink: 'test.com',
      updates: [],
      changes: [],
      heading,
      stability: { type: 'root', children: [stability] },
      content: section,
      tags: [],
    };
    const actual = metadata.create(apiDoc, section);
    delete actual.stability.toJSON;
    deepStrictEqual(actual, expected);
  });
});
