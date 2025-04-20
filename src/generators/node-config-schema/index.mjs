import { readFile, writeFile } from 'node:fs/promises';
import {
  ERRORS,
  ADD_OPTION_REGEX,
  BASIC_SCHEMA,
  OPTION_HEADER_KEY_REGEX,
  TYPE_DEFINITION_MAP,
} from './constants.mjs';
import { join } from 'node:path';

/**
 * This generator generates the `node.config.json` schema.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'node-config-schema',

  version: '1.0.0',

  description: 'Generates the node.config.json schema.',

  /**
   * Generates the `node.config.json` schema.
   * @param {unknown} _ - Unused parameter
   * @param {Partial<GeneratorOptions>} options - Options containing the input file paths
   * @throws {Error} If the required files node_options.cc or node_options.h are missing or invalid.
   */
  async generate(_, options) {
    let ccFile, hFile;

    // Ensure input files are provided and capture the paths
    for (const filePath of options.input) {
      if (filePath.endsWith('node_options.cc')) {
        ccFile = filePath;
      } else if (filePath.endsWith('node_options.h')) {
        hFile = filePath;
      }
    }

    // Error handling if either cc or h file is missing
    if (!ccFile || !hFile) {
      throw new Error(ERRORS.missingCCandHFiles);
    }

    // Read the contents of the cc and h files
    const ccContent = await readFile(ccFile, 'utf-8');
    const hContent = await readFile(hFile, 'utf-8');

    // Clone the BASIC_SCHEMA to avoid mutating the original schema object
    /** @type {typeof BASIC_SCHEMA} */
    const schema = Object.assign({}, BASIC_SCHEMA);
    const { nodeOptions } = schema.properties;

    // Process the cc content and match AddOption calls
    for (const [, option, config] of ccContent.matchAll(ADD_OPTION_REGEX)) {
      // If config doesn't include 'kAllowedInEnvvar', skip this option
      if (!config.includes('kAllowedInEnvvar')) {
        continue;
      }

      const headerKey = config.match(OPTION_HEADER_KEY_REGEX)?.[1];
      // If there's no header key, it's either a V8 option or a no-op
      if (!headerKey) {
        continue;
      }

      // Try to find the corresponding header type in the hContent
      const headerTypeMatch = hContent.match(
        new RegExp(`\\s*(.+)\\s${headerKey}[^\\B_]`)
      );

      if (!headerTypeMatch) {
        throw new Error(
          formatErrorMessage(ERRORS.headerTypeNotFound, { headerKey })
        );
      }

      const headerType = headerTypeMatch[1].trim();

      // Ensure the headerType exists in the TYPE_DEFINITION_MAP
      const typeDefinition = TYPE_DEFINITION_MAP[headerType];
      if (!typeDefinition) {
        throw new Error(
          formatErrorMessage(ERRORS.missingTypeDefinition, { headerType })
        );
      }

      // Add the option to the schema after removing the '--' prefix
      nodeOptions.properties[option.replace('--', '')] = typeDefinition;
    }

    nodeOptions.properties = Object.fromEntries(
      Object.keys(nodeOptions.properties)
        .sort()
        .map(key => [key, nodeOptions.properties[key]])
    );

    await writeFile(
      join(options.output, 'node-config-schema.json'),
      JSON.stringify(schema, null, 2) + '\n'
    );

    return schema;
  },
};

/**
 * Helper function to replace placeholders in error messages with dynamic values.
 * @param {string} message - The error message with placeholders.
 * @param {Object} params - The values to replace the placeholders.
 * @returns {string} - The formatted error message.
 */
function formatErrorMessage(message, params) {
  return message.replace(/{{(\w+)}}/g, (_, key) => params[key] || `{{${key}}}`);
}
