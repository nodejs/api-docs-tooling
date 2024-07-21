'use strict';

/**
 * This generator generates the legacy HTML pages of the legacy API docs
 * for retro-compatibility and while we are implementing the new 'react' and 'html' generators.
 *
 * This generator is a top-level generator, and it takes the raw AST tree of the API doc files
 * and generates the HTML files to the specified output directory from the configuration settings
 *
 * @typedef {import('../../types.d.ts').ApiDocMetadataEntry[]} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, void>}
 */
export default {
  name: 'legacyHtml',

  version: '1.0.0',

  description:
    'Generates the legacy version of the API docs in HTML, with the assets and styles included as files',

  dependsOn: 'ast',

  async generate() {
    throw new Error('Not yet implemented');
  },
};
