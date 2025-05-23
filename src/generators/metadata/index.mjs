'use strict';

import { parseApiDoc } from './utils/parse.mjs';

/**
 * This generator generates a flattened list of metadata entries from a API doc
 *
 * @typedef {ParserOutput<import('mdast').Root>[]} Input
 *
 * @type {GeneratorMetadata<Input, ApiDocMetadataEntry[]>}
 */
export default {
  name: 'metadata',

  version: '1.0.0',

  description: 'generates a flattened list of API doc metadata entries',

  dependsOn: 'ast',

  /**
   * @param {Input} inputs
   * @returns {Promise<ApiDocMetadataEntry[]>}
   */
  async generate(inputs) {
    return inputs.flatMap(input => parseApiDoc(input));
  },
};
