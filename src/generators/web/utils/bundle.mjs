import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/postcss';
import esbuild from 'esbuild';
import stylePlugin from 'esbuild-style-plugin';
import postcssCalc from 'postcss-calc';

import { ESBUILD_RESOLVE_DIR } from '../constants.mjs';
import staticData from './staticData.mjs';

const uiComponentsResolver = {
  name: 'ui-components-resolver',
  /**
   * This plugin intercepts imports starting with '@node-core/ui-components' or '#ui/' and resolves them
   * to the corresponding index.tsx file first, then .tsx file if index doesn't exist.
   * @param {import('esbuild').PluginBuild} build
   */
  setup(build) {
    build.onResolve({ filter: /^(@node-core\/ui-components|#ui\/)/ }, args => {
      // Skip if path already has file extension
      if (/\.[a-zA-Z0-9]+$/.test(args.path)) {
        return undefined;
      }

      // Normalize #ui/ prefix to @node-core/ui-components/
      const normalizedPath = args.path.replace(
        /^#ui\//,
        '@node-core/ui-components/'
      );

      // Try index.tsx first
      const indexPath = fileURLToPath(
        import.meta.resolve(`${normalizedPath}/index.tsx`)
      );
      if (existsSync(indexPath)) {
        return { path: indexPath };
      }

      // Try .tsx extension
      const directPath = fileURLToPath(
        import.meta.resolve(`${normalizedPath}.tsx`)
      );
      if (existsSync(directPath)) {
        return { path: directPath };
      }

      // Fall back to default resolution
      return undefined;
    });
  },
};

/**
 * Bundles JavaScript code and returns JS/CSS content
 * @param {string} code - Source code to bundle
 * @param {import('esbuild').BuildOptions} options
 * @returns {Promise<{js: string, css: string}>}
 */
export default async (code, options) => {
  const result = await esbuild.build({
    stdin: {
      contents: code,
      resolveDir: ESBUILD_RESOLVE_DIR,
      loader: 'jsx',
    },
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    write: false,
    define: {
      __STATIC_DATA__: staticData,
    },
    // This output file is a pseudo-file. It's never written (`write: false`),
    // but it gives ESLint a basename for the output.
    outfile: 'output.js',
    plugins: [
      stylePlugin({
        postcss: {
          plugins: [tailwindcss(), postcssCalc()],
        },
      }),
      uiComponentsResolver,
    ],
    ...options,
  });

  const [jsFile, cssFile] = result.outputFiles;

  return {
    js: jsFile.text,
    css: cssFile?.text,
  };
};
