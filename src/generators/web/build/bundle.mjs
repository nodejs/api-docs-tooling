import virtual from '@rollup/plugin-virtual';
import { build } from 'rolldown';

import cssLoader from './css.mjs';
import staticData from './data.mjs';

/**
 * Bundles JavaScript code and returns JS/CSS content
 * @param {string} code - Source code to bundle
 * @param {{ server: boolean }} options - Bundle configuration options
 * @returns {Promise<{ js: string, css: string }>} The bundled code
 */
export default async function bundle(code, { server = false } = {}) {
  const result = await build({
    input: 'entrypoint.jsx',
    output: {
      format: server ? 'cjs' : 'iife',
      minify: !server,
    },
    platform: server ? 'node' : 'browser',
    external: server ? ['preact', '@node-core/ui-components'] : [],
    // Before updating this, update `../ui/types.d.ts`
    define: {
      // Inject static data at build time
      __STATIC_DATA__: staticData,

      // Environment flags for conditional code
      // Use `if (CLIENT)` or `if (SERVER)` to target specific environments
      // The unused code will be removed during tree-shaking
      SERVER: String(server),
      CLIENT: String(!server),
    },
    jsx: 'react-jsx',
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
    plugins: [
      virtual({
        'entrypoint.jsx': code,
      }),
      cssLoader(),
    ],
    treeshake: true,
    write: false,
  });

  const [js, ...cssFiles] = result.output;

  return { js: js.code, css: cssFiles.map(f => f.source).join('') };
}
