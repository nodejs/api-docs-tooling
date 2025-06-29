import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it, mock } from 'node:test';

const existsSync = mock.fn();
mock.module('node:fs', { namedExports: { ...fs, existsSync } });

const { default: getPlugins } = await import('../plugins.mjs');

describe('uiComponentsResolverPlugin', async () => {
  let onResolveCallback;

  getPlugins(true)[0].setup({
    onResolve: (_, callback) => {
      onResolveCallback = callback;
    },
  });

  it('should skip paths with file extensions', () => {
    const result = onResolveCallback({
      path: '@node-core/ui-components/button.tsx',
    });
    assert.equal(result, undefined);
  });

  it('should process paths without extensions', () => {
    existsSync.mock.mockImplementation(() => false);

    const result = onResolveCallback({
      path: '@node-core/ui-components/button',
    });
    assert.equal(result, undefined); // Returns undefined when no files exist
  });

  it('should resolve when index.tsx exists', () => {
    existsSync.mock.mockImplementation(path => path.includes('index.tsx'));

    const result = onResolveCallback({
      path: '@node-core/ui-components/button',
    });

    assert.ok(result.path.includes('button'));
    assert.ok(result.path.endsWith('index.tsx'));
  });

  it('should fall back to .tsx when index.tsx does not exist', () => {
    existsSync.mock.mockImplementation(
      path => path.endsWith('.tsx') && !path.includes('index.tsx')
    );

    const result = onResolveCallback({
      path: '@node-core/ui-components/button',
    });

    assert.ok(result.path.includes('button'));
    assert.ok(result.path.endsWith('.tsx'));
    assert.ok(!result.path.includes('index.tsx'));
  });

  it('should return undefined when no files exist', () => {
    existsSync.mock.mockImplementation(() => false);

    const result = onResolveCallback({
      path: '@node-core/ui-components/button',
    });
    assert.equal(result, undefined);
  });

  it('should handle #ui/ alias conversion', () => {
    existsSync.mock.mockImplementation(() => false);

    // Should not throw and should attempt resolution
    const result = onResolveCallback({ path: '#ui/button' });
    assert.equal(result, undefined);
  });
});
