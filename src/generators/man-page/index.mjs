'use strict';

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  convertOptionToMandoc,
  convertEnvVarToMandoc,
} from './utils/converter.mjs';

/**
 * This generator generates a man page version of the CLI.md file.
 * See https://man.openbsd.org/mdoc.7 for the formatting.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, string>}
 */
export default {
  name: 'man-page',

  version: '1.0.0',

  description: 'Generates the Node.js man-page.',

  dependsOn: 'ast',

  async generate(input, options) {
    // Find the appropriate headers
    const optionsStart = input.findIndex(({ slug }) => slug === 'options');
    const environmentStart = input.findIndex(
      ({ slug }) => slug === 'environment-variables-1'
    );

    if (optionsStart + environmentStart <= 0) {
      throw new Error('Could not find headers');
    }

    // Generate the option mandoc
    let optionsOutput = '';
    for (let i = optionsStart + 1; i < environmentStart; i++) {
      const el = input[i];
      if (el.heading.depth === 3) {
        optionsOutput += convertOptionToMandoc(el);
      }
    }

    // Generate the environment mandoc
    let envOutput = '';
    for (let i = environmentStart + 1; i < input.length; i++) {
      const el = input[i];
      if (el.heading.depth === 3) {
        envOutput += convertEnvVarToMandoc(el);
      }
      if (el.heading.depth < 3) break;
    }

    const apiTemplate = await readFile(
      join(import.meta.dirname, 'template.1'),
      'utf-8'
    );
    const template = apiTemplate
      .replace('__OPTIONS__', optionsOutput)
      .replace('__ENVIRONMENT__', envOutput);

    await writeFile(options.output, template);
  },
};
