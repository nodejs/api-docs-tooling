import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/postcss';
import stylePlugin from 'esbuild-style-plugin';
import postcssCalc from 'postcss-calc';

/**
 * ESBuild plugin that resolves UI component imports
 *
 * This plugin intercepts imports starting with '@node-core/ui-components' or '#ui/'
 * and resolves them to the corresponding TypeScript files. It follows a resolution
 * strategy where it first tries to find an index.tsx file, then falls back to a
 * .tsx file with the same name.
 */
const uiComponentsResolverPlugin = {
  name: 'ui-components-resolver',

  /**
   * @param {import('esbuild').PluginBuild} build
   */
  setup(build) {
    build.onResolve(
      { filter: /^(@node-core\/ui-components|#ui\/)/ },
      ({ path }) => {
        // Skip paths that already have file extensions
        if (/\.[a-zA-Z0-9]+$/.test(path)) return;

        // Normalize the import path by converting #ui/ alias to the full package name
        const normalizedPath = path.replace(
          /^#ui\//,
          '@node-core/ui-components/'
        );

        // Resolution strategy: try index.tsx first, then .tsx
        const resolutionSuffixes = ['/index.tsx', '.tsx'];

        for (const suffix of resolutionSuffixes) {
          try {
            const resolvedPath = fileURLToPath(
              import.meta.resolve(normalizedPath + suffix)
            );

            if (existsSync(resolvedPath)) {
              return { path: resolvedPath };
            }
          } catch {
            // Silently ignore resolution errors and try the next suffix
            continue;
          }
        }

        // If no resolution found, let ESBuild handle it with default behavior
        return undefined;
      }
    );
  },
};

/**
 * Creates and returns an array of ESBuild plugins for the build process
 *
 * @param {boolean} server - Whether this is running in server mode.
 */
export default server => {
  const plugins = [
    uiComponentsResolverPlugin,
    stylePlugin(
      // We still need to include `stylePlugin` on the server, so that
      // the hydrated HTML will have the class names we need, however,
      // we don't need to parse them through PostCSS for performance.
      server
        ? {}
        : {
            postcss: {
              plugins: [tailwindcss(), postcssCalc()],
            },
          }
    ),
  ];

  return plugins;
};
