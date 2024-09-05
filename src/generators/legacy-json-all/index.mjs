'use strict';

import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * @typedef {Array<import('../types.d.ts').Section[]>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, import('./types.d.ts').Output>}
 */
export default {
  name: 'legacy-json-all',

  version: '1.0.0',

  description:
    'Generates the `all.json` file from the `legacy-json` generator, which includes all the modules in one single file.',

  dependsOn: 'legacy-json',

  async generate(input, { output }) {
    /**
     * @type {import('./types.d.ts').Output}
     */
    const generatedValue = {
      miscs: [],
      modules: [],
      classes: [],
      globals: [],
      methods: [],
    };

    for (const section of input) {
      // Copy the relevant properties from each section into our output
      for (const property of [
        'miscs',
        'modules',
        'classes',
        'globals',
        'methods',
      ]) {
        if (section[property]) {
          generatedValue[property].push(...section[property]);
        }
      }
    }

    await writeFile(
      join(output, 'all.json'),
      JSON.stringify(generatedValue),
      'utf8'
    );

    return generatedValue;
  },
};
