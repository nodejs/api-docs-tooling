import { readFile, writeFile } from 'node:fs/promises';
import {
  ERRORS,
  ADD_OPTION_REGEX,
  OPTION_HEADER_KEY_REGEX,
} from './constants.mjs';
import { join } from 'node:path';
import schema from './schema.json' with { type: 'json' };

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
    // Ensure input files are provided and capture the paths
    const ccFile = options.input.find(filePath =>
      filePath.endsWith('node_options.cc')
    );
    const hFile = options.input.find(filePath =>
      filePath.endsWith('node_options.h')
    );

    // Error handling if either cc or h file is missing
    if (!ccFile || !hFile) {
      throw new Error(ERRORS.missingCCandHFiles);
    }

    // Read the contents of the cc and h files
    const ccContent = await readFile(ccFile, 'utf-8');
    const hContent = await readFile(hFile, 'utf-8');

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

      // Add the option to the schema after removing the '--' prefix
      nodeOptions.properties[option.replace('--', '')] = getTypeSchema(
        headerTypeMatch[1].trim()
      );
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

/**
 * Returns the JSON Schema definition for a given C++ type.
 *
 * @param {string} type - The type to get the schema for.
 * @returns {object} JSON Schema definition for the given type.
 */
function getTypeSchema(type) {
  switch (type) {
    case 'std::vector<std::string>':
      return {
        oneOf: [
          { type: 'string' },
          {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
        ],
      };
    case 'uint64_t':
    case 'int64_t':
    case 'HostPort':
      return { type: 'number' };
    case 'std::string':
      return { type: 'string' };
    case 'bool':
      return { type: 'boolean' };
    default:
      throw new Error(
        formatErrorMessage(ERRORS.missingTypeDefinition, { type })
      );
  }
}
