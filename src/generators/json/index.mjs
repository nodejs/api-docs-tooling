'use strict';

import { cp } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * @type {import('../types.d.ts').GeneratorMetadata<Input, string>}
 */
export default {
  name: 'json',

  version: '1.0.0',

  description: '',

  dependsOn: 'ast',
  // todo add test w/ https://www.npmjs.com/package/jsonschema
  async generate(input, { output }) {
    // Current directory path relative to the `index.mjs` file
    const baseDir = import.meta.dirname;

    await cp(join(baseDir, 'schema.json'), join(output, 'schema.json'));
  },
};
