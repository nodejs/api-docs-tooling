/**
 * @type {ApiDocMetadataEntry}
 */
export const assertEntry = {
  api: 'assert',
  slug: 'assert',
  source_link: 'lib/assert.js',
  api_doc_source: 'doc/api/assert.md',
  added_in: undefined,
  deprecated_in: undefined,
  removed_in: undefined,
  n_api_version: undefined,
  changes: [
    {
      version: 'v9.9.0',
      'pr-url': 'https://github.com/nodejs/node/pull/17615',
      description: 'Added error diffs to the strict assertion mode.',
    },
    {
      version: 'v9.9.0',
      'pr-url': 'https://github.com/nodejs/node/pull/17002',
      description: 'Added strict assertion mode to the assert module.',
    },
    {
      version: ['v13.9.0', 'v12.16.2'],
      'pr-url': 'https://github.com/nodejs/node/pull/31635',
      description:
        'Changed "strict mode" to "strict assertion mode" and "legacy mode" to "legacy assertion mode" to avoid confusion with the more usual meaning of "strict mode".',
    },
    {
      version: 'v15.0.0',
      'pr-url': 'https://github.com/nodejs/node/pull/34001',
      description: "Exposed as `require('node:assert/strict')`.",
    },
    {
      version: 'REPLACEME',
      'pr-url': 'https://github.com/nodejs/node/pull/12345',
      description: 'This is a test entry.',
    },
  ],
  heading: {
    type: 'heading',
    depth: 1,
    children: [
      {
        type: 'text',
        value: 'Assert',
        position: {
          start: { line: 1, column: 3, offset: 2 },
          end: { line: 1, column: 9, offset: 8 },
        },
      },
    ],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 9, offset: 8 },
    },
    data: {
      text: 'Assert',
      name: 'Assert',
      depth: 1,
      slug: 'assert',
      type: 'property',
    },
  },
  stability: {
    type: 'root',
    children: [],
  },
  content: {
    type: 'root',
    children: [],
  },
  tags: [],
  introduced_in: 'v0.1.21',
  yaml_position: {
    start: { line: 7, column: 1, offset: 103 },
    end: { line: 7, column: 35, offset: 137 },
  },
};
