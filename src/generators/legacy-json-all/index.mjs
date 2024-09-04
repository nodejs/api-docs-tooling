'use strict';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * @typedef {Array<import('../legacy-json/types.d.ts').Section>} Input
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

    const propertiesToCopy = [
      'miscs',
      'modules',
      'classes',
      'globals',
      'methods',
    ];

    input.forEach(section => {
      // Copy the relevant properties from each section into our output
      propertiesToCopy.forEach(property => {
        if (section[property]) {
          generatedValue[property].push(...section[property]);
        }
      });
    });

    await writeFile(join(output, 'all.json'), JSON.stringify(generatedValue));

    return generatedValue;
  },
};