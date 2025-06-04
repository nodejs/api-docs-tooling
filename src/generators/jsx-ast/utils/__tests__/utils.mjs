export const SAMPLE = {
  api: 'sample-api',
  heading: {
    depth: 2,
    data: { name: 'SampleFunc', slug: 'sample-func', type: 'function' },
  },
  content: {
    type: 'root',
    children: [
      { type: 'text', value: 'Example text for testing reading time.' },
    ],
  },
  added_in: 'v1.0.0',
  source_link: '/src/index.js',
  changes: [
    {
      version: 'v1.1.0',
      description: 'Improved performance',
      'pr-url': 'https://github.com/org/repo/pull/123',
    },
  ],
};
