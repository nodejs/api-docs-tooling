'use strict';

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  convertOptionToMandoc,
  convertEnvVarToMandoc,
} from './utils/converter.mjs';

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#options
// This slug should reference the section where the available
// options are defined.
const OPTIONS_SLUG = 'options';

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#environment-variables-1
// This slug should reference the section where the available
// environment variables are defined.
const ENVIRONMENT_SLUG = 'evironment-options-1';

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
      throw new Error('Could not find any `cli` documentation.');
    }

    // Find the appropriate headers
    const optionsStart = components.findIndex(
      ({ slug }) => slug === OPTIONS_SLUG
    );
    const environmentStart = components.findIndex(
      ({ slug }) => slug === ENVIRONMENT_SLUG
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
