import { strictEqual, deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import GitHubSlugger from 'github-slugger';
import { VFile } from 'vfile';

import createMetadata from '../metadata.mjs';
import { u } from 'unist-builder';

describe('createMetadata', () => {
  it('should set the heading correctly', () => {
    const slugger = new GitHubSlugger();
    const metadata = createMetadata(slugger);
    const heading = u('heading', {
      type: 'heading',
      data: {
        text: 'Test Heading',
        type: 'test',
        name: 'test',
        depth: 1,
      },
    });
    metadata.setHeading(heading);
    strictEqual(metadata.create(new VFile(), {}).heading.data, heading.data);
  });

  it('should set the stability correctly', () => {
    const slugger = new GitHubSlugger();
    const metadata = createMetadata(slugger);
    const stability = {
      type: 'root',
      data: { index: 2, description: '' },
      children: [],
    };
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
      type: 'heading',
      data: {
        text: 'Test Heading',
        type: 'test',
        name: 'test',
        depth: 1,
      },
    };
    const stability = {
      type: 'root',
      data: { index: 2, description: '' },
      children: [],
    };
    const properties = { source_link: 'test.com' };
    metadata.setHeading(heading);
    metadata.addStability(stability);
    metadata.updateProperties(properties);
    const expected = {
      added_in: undefined,
      api: 'test',
      changes: [],
      content: section,
      deprecated_in: undefined,
      heading,
      n_api_version: undefined,
      removed_in: undefined,
      slug: 'test-heading',
      source_link: 'test.com',
      stability: { type: 'root', children: [stability] },
      tags: [],
      updates: [],
    };
    const actual = metadata.create(apiDoc, section);
    delete actual.stability.toJSON;
    delete actual.heading.toJSON;
    deepStrictEqual(actual, expected);
  });
});
