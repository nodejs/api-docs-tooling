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
        slug: 'test.html#',
        updates: [],
        changes: [],
        heading: {
          children: [
            {
              position: {
                end: {
                  column: 15,
                  line: 1,
                  offset: 14,
                },
                start: {
                  column: 3,
                  line: 1,
                  offset: 2,
                },
              },
              type: 'text',
              value: 'Test Heading',
            },
          ],
          data: {
            depth: 1,
            name: 'Test Heading',
            text: 'Test Heading',
            type: 'module',
          },
          depth: 1,
          position: {
            end: {
              column: 15,
              line: 1,
              offset: 14,
            },
            start: {
              column: 1,
              line: 1,
              offset: 0,
            },
          },
          type: 'heading',
        },
        sourceLink: undefined,
        stability: { type: 'root', children: [] },
        content: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'This is a test.',
                  position: {
                    start: { line: 3, column: 1, offset: 16 },
                    end: { line: 3, column: 16, offset: 31 },
                  },
                },
              ],
              position: {
                start: { line: 3, column: 1, offset: 16 },
                end: { line: 3, column: 16, offset: 31 },
              },
            },
          ],
        },
        tags: [],
      },
    ];
    const actual = await parser.parseApiDoc(apiDoc);
    delete actual[0].heading.toJSON;
    delete actual[0].stability.toJSON;
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
        slug: 'test1.html#',
        updates: [],
        changes: [],
        heading: {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Test Heading 1',
              position: {
                start: { line: 1, column: 3, offset: 2 },
                end: { line: 1, column: 17, offset: 16 },
              },
            },
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 17, offset: 16 },
          },
          data: {
            text: 'Test Heading 1',
            type: 'module',
            name: 'Test Heading 1',
            depth: 1,
          },
        },
        sourceLink: undefined,
        stability: { type: 'root', children: [] },
        content: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'This is a test.',
                  position: {
                    start: { line: 3, column: 1, offset: 18 },
                    end: { line: 3, column: 16, offset: 33 },
                  },
                },
              ],
              position: {
                start: { line: 3, column: 1, offset: 18 },
                end: { line: 3, column: 16, offset: 33 },
              },
            },
          ],
        },
        tags: [],
      },
      {
        api: 'test2',
        slug: 'test2.html#',
        updates: [],
        changes: [],
        heading: {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Test Heading 2',
              position: {
                start: { line: 1, column: 3, offset: 2 },
                end: { line: 1, column: 17, offset: 16 },
              },
            },
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 17, offset: 16 },
          },
          data: {
            text: 'Test Heading 2',
            type: 'module',
            name: 'Test Heading 2',
            depth: 1,
          },
        },
        sourceLink: undefined,
        stability: { type: 'root', children: [] },
        content: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'This is another test.',
                  position: {
                    start: { line: 3, column: 1, offset: 18 },
                    end: { line: 3, column: 22, offset: 39 },
                  },
                },
              ],
              position: {
                start: { line: 3, column: 1, offset: 18 },
                end: { line: 3, column: 22, offset: 39 },
              },
            },
          ],
        },
        tags: [],
      },
    ];
    const actual = await parser.parseApiDocs(apiDocs);
    actual.forEach(entry => {
      delete entry.heading.toJSON;
      delete entry.stability.toJSON;
      delete entry.content.toJSON;
    });
    deepStrictEqual(actual, expected);
  });
});
