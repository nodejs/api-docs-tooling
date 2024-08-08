import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { VFile } from 'vfile';
import createParser from '../parser.mjs';

describe('createParser', () => {
  it('should parse a single API doc correctly', async () => {
    const parser = createParser();
    const apiDoc = new VFile({
      path: 'test.md',
      value: '# Test Heading\n\nThis is a test.',
    });
    const expected = [
      {
        api: 'test',
        slug: 'test.html#test-heading',
        sourceLink: undefined,
        updates: [],
        changes: [],
        heading: {
          text: 'Test Heading',
          type: 'module',
          name: 'Test Heading',
          depth: 1,
        },
        stability: undefined,
        content: { type: 'root', children: [] },
      },
    ];
    const actual = await parser.parseApiDoc(apiDoc);
    delete actual[0].content.toJSON;
    deepStrictEqual(actual, expected);
  });

  it('should parse multiple API docs correctly', async () => {
    const parser = createParser();
    const apiDocs = [
      new VFile({
        path: 'test1.md',
        value: '# Test Heading 1\n\nThis is a test.',
      }),
      new VFile({
        path: 'test2.md',
        value: '# Test Heading 2\n\nThis is another test.',
      }),
    ];
    const expected = [
      {
        api: 'test1',
        slug: 'test1.html#test-heading-1',
        sourceLink: undefined,
        updates: [],
        changes: [],
        heading: {
          text: 'Test Heading 1',
          type: 'module',
          name: 'Test Heading 1',
          depth: 1,
        },
        stability: undefined,
        content: { type: 'root', children: [] },
      },
      {
        api: 'test2',
        slug: 'test2.html#test-heading-2',
        sourceLink: undefined,
        updates: [],
        changes: [],
        heading: {
          text: 'Test Heading 2',
          type: 'module',
          name: 'Test Heading 2',
          depth: 1,
        },
        stability: undefined,
        content: { type: 'root', children: [] },
      },
    ];
    const actual = await parser.parseApiDocs(apiDocs);
    actual.forEach(entry => delete entry.content.toJSON);
    deepStrictEqual(actual, expected);
  });
});
