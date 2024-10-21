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
    // Filter to only 'cli'.
    const components = input.filter(({ api }) => api === 'cli');
    if (!components.length) {
      throw new Error('CLI.md not found');
    }

    // Find the appropriate headers
    const optionsStart = components.findIndex(({ slug }) => slug === 'options');
    const environmentStart = components.findIndex(
      ({ slug }) => slug === 'environment-variables-1'
    );
    // The first header that is <3 in depth after environmentStart
    const environmentEnd = components.findIndex(
      ({ heading }, index) => heading.depth < 3 && index > environmentStart
    );

    const output = {
      // Extract the CLI options.
      options: extractMandoc(
        components,
        optionsStart + 1,
        environmentStart,
        convertOptionToMandoc
      ),
      // Extract the environment variables.
      env: extractMandoc(
        components,
        environmentStart + 1,
        environmentEnd,
        convertEnvVarToMandoc
      ),
    };

    const template = await readFile(
      join(import.meta.dirname, 'template.1'),
      'utf-8'
    );

    const filledTemplate = template
      .replace('__OPTIONS__', output.options)
      .replace('__ENVIRONMENT__', output.env);

    await writeFile(options.output, filledTemplate);
  },
};

function extractMandoc(components, start, end, convert) {
  return components
    .slice(start, end)
    .filter(({ heading }) => heading.depth === 3)
    .map(convert)
    .join('');
}
