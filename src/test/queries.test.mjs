import { strictEqual, deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import createQueries from '../queries.mjs';

describe('createQueries', () => {
  it('should add YAML metadata correctly', () => {
    const queries = createQueries();
    const node = { value: 'type: test\nname: test\n' };
    const apiEntryMetadata = {
      updateProperties: properties => {
        deepStrictEqual(properties, { type: 'test', name: 'test' });
      },
    };
    queries.addYAMLMetadata(node, apiEntryMetadata);
  });

  // valid type
  it('should update type to reference correctly', () => {
    const queries = createQueries();
    const node = { value: 'This is a {string} type.' };
    queries.updateTypeReference(node);
    strictEqual(node.type, 'html');
    strictEqual(
      node.value,
      'This is a [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) type.'
    );
  });

  it('should update type to reference not correctly if no match', () => {
    const queries = createQueries();
    const node = { value: 'This is a {test} type.' };
    queries.updateTypeReference(node);
    strictEqual(node.type, 'html');
    strictEqual(node.value, 'This is a {test} type.');
  });

  it('should add heading metadata correctly', () => {
    const queries = createQueries();
    const node = {
      depth: 2,
      children: [{ type: 'text', value: 'Test Heading' }],
    };
    const apiEntryMetadata = {
      setHeading: heading => {
        deepStrictEqual(heading, {
          children: [
            {
              type: 'text',
              value: 'Test Heading',
            },
          ],
          data: {
            depth: 2,
            name: 'Test Heading',
            text: 'Test Heading',
            type: 'module',
          },
          depth: 2,
        });
      },
    };
    queries.setHeadingMetadata(node, apiEntryMetadata);
  });

  it('should update markdown link correctly', () => {
    const queries = createQueries();
    const node = { type: 'link', url: 'test.md#heading' };
    queries.updateMarkdownLink(node);
    strictEqual(node.url, 'test.html#heading');
  });

  it('should update link reference correctly', () => {
    const queries = createQueries();
    const node = { type: 'linkReference', identifier: 'test' };
    const definitions = [{ identifier: 'test', url: 'test.html#test' }];
    queries.updateLinkReference(node, definitions);
    strictEqual(node.type, 'link');
    strictEqual(node.url, 'test.html#test');
  });

  it('should add stability index metadata correctly', () => {
    const queries = createQueries();
    const node = {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Stability: 2 - Frozen' }],
        },
      ],
    };
    const apiEntryMetadata = {
      addStability: stability => {
        deepStrictEqual(stability.data, {
          index: 2,
          description: 'Frozen',
        });
      },
    };
    queries.addStabilityMetadata(node, apiEntryMetadata);
  });
});
