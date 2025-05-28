import { readFile } from 'node:fs/promises';

import { bundleAsync } from 'lightningcss';

/**
 * Rolldown plugin to compile `.module.css` files using lightningcss
 * and emit a single bundled CSS file.
 *
 * TODO(avivkeller): Once Rolldown supports CSS Modules natively, we
 * can remove this
 *
 * @returns {import('rolldown').Plugin}
 */
export default () => {
  const cssChunks = new Set();

  return {
    name: 'css-loader',

    /**
     * Handles loading and transforming CSS module files
     * @param {string} id - The file path being loaded
     */
    async load(id) {
      if (!id.endsWith('.module.css')) {
        return null;
      }

      const source = await readFile(id, 'utf8');

      const { code, exports } = await bundleAsync({
        filename: id,
        code: Buffer.from(source),
        cssModules: true,
      });

      cssChunks.add(code.toString());

      const mappedExports = Object.fromEntries(
        Object.entries(exports).map(([k, v]) => [k, v.name])
      );

      return {
        code: `export default ${JSON.stringify(mappedExports)};`,
        moduleType: 'js',
      };
    },

    /**
     * Emits the collected CSS as a single file at the end of the build
     */
    buildEnd() {
      if (cssChunks.size === 0) return;

      this.emitFile({
        type: 'asset',
        name: 'styles.css',
        source: Array.from(cssChunks).join(''),
      });
    },
  };
};
