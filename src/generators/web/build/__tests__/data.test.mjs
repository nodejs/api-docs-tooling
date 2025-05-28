import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

mock.module('@node-core/rehype-shiki', {
  namedExports: {
    shiki: {
      getLoadedLanguages: () => ['javascript', 'python'],
      getLanguage: lang => ({
        name: lang,
        _grammar: {
          aliases: lang === 'javascript' ? ['js'] : [],
          displayName: lang === 'javascript' ? 'JavaScript' : 'Python',
        },
      }),
    },
  },
});

const { createStaticData } = await import('../data.mjs');

describe('createStaticData', () => {
  it('should return shikiDisplayNameMap array', () => {
    const result = createStaticData();

    assert.ok(Array.isArray(result.shikiDisplayNameMap));
    assert.equal(result.shikiDisplayNameMap.length, 2);
  });

  it('should format language data correctly', () => {
    const result = createStaticData();
    const [jsAliases, jsDisplayName] = result.shikiDisplayNameMap[0];

    assert.deepEqual(jsAliases, ['js', 'javascript']);
    assert.equal(jsDisplayName, 'JavaScript');
  });

  it('should handle languages without aliases', () => {
    const result = createStaticData();
    const pythonEntry = result.shikiDisplayNameMap.find(([aliases]) =>
      aliases.includes('python')
    );

    assert.deepEqual(pythonEntry[0], ['python']);
    assert.equal(pythonEntry[1], 'Python');
  });
});
