import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

mock.module('node:fs/promises', {
  namedExports: {
    readFile: mock.fn(() => Promise.resolve('<html>{{title}}</html>')),
    writeFile: mock.fn(() => Promise.resolve()),
  },
});

const { executeServerCode, processEntry } = await import('../index.mjs');

describe('executeServerCode', () => {
  it('should execute and return the `code` variable', async () => {
    const result = await executeServerCode('code = "test"', mock.fn());
    assert.equal(typeof result, 'string');
  });
});

describe('processEntry', () => {
  it('should return HTML and CSS', async () => {
    const entry = {
      type: 'Literal',
      data: {
        heading: { data: { name: 'Test' } },
        api: 'test',
      },
    };

    const uuid = JSON.stringify(crypto.randomUUID());

    const result = await processEntry(
      entry,
      '{{{javascript}}}',
      {
        buildServerProgram: mock.fn(() => ''),
        buildClientProgram: mock.fn(() => uuid),
      },
      mock.fn(),
      null
    );

    assert.ok(result.html.startsWith(uuid));
  });
});
