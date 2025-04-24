import { ERRORS } from './constants.mjs';

/**
 * Helper function to replace placeholders in error messages with dynamic values.
 * @param {string} message - The error message with placeholders.
 * @param {Object} params - The values to replace the placeholders.
 * @returns {string} - The formatted error message.
 */
export function formatErrorMessage(message, params) {
  return message.replace(/{{(\w+)}}/g, (_, key) => params[key] || `{{${key}}}`);
}

/**
 * Returns the JSON Schema definition for a given C++ type.
 *
 * @param {string} type - The type to get the schema for.
 * @returns {object} JSON Schema definition for the given type.
 */
export function getTypeSchema(type) {
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
