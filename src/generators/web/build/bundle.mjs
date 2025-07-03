import { writeFile } from 'node:fs/promises';

import esbuild from 'esbuild';

import { RESOLVE_DIR } from '../constants.mjs';
import staticData from './data.mjs';
import getPlugins from './plugins.mjs';

/** @typedef {{ server: boolean, debug: boolean }} BundleOptions */

/**
 * Creates the esbuild configuration object
 * @param {string} code - Source code to bundle
 * @param {BundleOptions} options - Options
 * @returns {import('esbuild').BuildOptions} ESBuild configuration
 */
const createConfig = (code, { server, debug }) => ({
  stdin: {
    contents: code,
    resolveDir: RESOLVE_DIR,
    loader: 'jsx',
  },
  bundle: true,
  minify: true,
  format: 'iife',
  platform: server ? 'node' : 'browser',
  jsx: 'automatic',
  write: false,
  outfile: 'output.js',
  // When updating the `define` object, also update client/types.d.ts to
  // include the newly defined globals
  define: {
    // Inject static data at build time
    __STATIC_DATA__: staticData,
    // Use `if (CLIENT)` or `if (SERVER)` to conditionally run code for specific environments,
    // and omit it otherwise. The `client/package.json` includes `sideEffects: false` to let
    // ESBuild safely tree-shake that directory. However, this doesn't affect dependencies,
    // so our tree-shaking ability is limited.
    //
    // TODO(@avivkeller): Consider switching to Rolldown once it's stable, as it offers
    // improved tree-shaking support, with the high-speed of ESBuild.
    SERVER: String(server),
    CLIENT: String(!server),
  },
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  external: server ? ['preact'] : [],
  plugins: getPlugins(server),
  // We silence warnings since ESBuild will warn that Tailwind's CSS isn't valid,
  // but if something actually goes wrong, errors are still reported.
  logLevel: 'error',
  metafile: debug,
});

/**
 * Bundles JavaScript code and returns JS/CSS content
 * @param {string} code - Source code to bundle
 * @param {BundleOptions} options - Options
 * @returns {Promise<{js: string, css?: string}>}
 */
export default async (code, { server = false, debug = false } = {}) => {
  const config = createConfig(code, { server, debug });
  const result = await esbuild.build(config);
  const [jsFile, cssFile] = result.outputFiles;

  if (debug) {
    await writeFile(
      `out/meta-${server ? 'server' : 'client'}.json`,
      JSON.stringify(result.metafile)
    );
  }

  return {
    js: jsFile.text,
    css: cssFile?.text,
  };
};
