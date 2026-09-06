import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAllPage } from '../all.mjs';

const createPage = (
  api,
  name,
  { depth = 1, chunk, synthetic, minutes } = {}
) => ({
  data: {
    api,
    path: `/${api}`,
    basename: api,
    chunk,
    synthetic,
    heading: { depth, data: { name, text: name, slug: api } },
  },
  headings: [{ depth, value: name, slug: api }],
  readingTime:
    minutes === undefined
      ? undefined
      : { text: `${minutes} min read`, minutes },
  content: `<><h1>${name}</h1></>`,
});

describe('buildAllPage', () => {
  it('returns a synthetic `all` page made of the module pages, in sidebar order', () => {
    const { data, headings, parts } = buildAllPage([
      createPage('zlib', 'Zlib'),
      createPage('index', 'Index'),
      createPage('fs', 'File system'),
      createPage('404', 'Page Not Found', { synthetic: true }),
      createPage('fs-readfile', 'readFile', { chunk: { api: 'fs' } }),
    ]);

    assert.equal(data.api, 'all');
    assert.equal(data.path, '/all');
    assert.equal(data.heading.data.name, 'All');
    assert.equal(data.synthetic, true);
    // The index, the other synthetic pages and the chunk pages are left out
    assert.deepEqual(parts, ['fs', 'zlib']);
    assert.deepEqual(
      headings.map(({ value }) => value),
      ['File system', 'Zlib']
    );
  });

  it('sums the reading time of its parts when it is shown', () => {
    const { readingTime } = buildAllPage([
      createPage('fs', 'File system', { minutes: 2.4 }),
      createPage('zlib', 'Zlib', { minutes: 1.2 }),
    ]);

    assert.equal(readingTime.text, '4 min read');
    assert.ok(Math.abs(readingTime.minutes - 3.6) < 1e-9);
  });

  it('has no reading time when the pages have none', () => {
    const { readingTime } = buildAllPage([createPage('fs', 'File system')]);

    assert.equal(readingTime, undefined);
  });
});
