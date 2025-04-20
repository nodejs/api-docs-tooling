// Error Messages
export const ERRORS = {
  missingCCandHFiles:
    'Both node_options.cc and node_options.h must be provided.',
  headerTypeNotFound:
    'Header type for "{{headerKey}}" not found in the header file.',
  missingTypeDefinition:
    'No type definition found for header type "{{headerType}}" in TYPE_DEFINITION_MAP.',
};

// Regex pattern to match calls to the AddOption function.
export const ADD_OPTION_REGEX =
  /AddOption[\s\n\r]*\([\s\n\r]*"([^"]+)"(.*?)\);/gs;

// Regex pattern to match header keys in the Options class.
export const OPTION_HEADER_KEY_REGEX = /Options::(\w+)/;

// Basic JSON schema for node.config.json
export const BASIC_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    $schema: {
      type: 'string',
    },
    nodeOptions: {
      additionalProperties: false,
      properties: {},
      type: 'object',
    },
  },
  type: 'object',
};

// Schema Definition Map for Data Types
export const TYPE_DEFINITION_MAP = {
  'std::vector<std::string>': {
    oneOf: [
      { type: 'string' }, // Single string case
      {
        items: { type: 'string', minItems: 1 }, // Array of strings, ensuring at least one item
        type: 'array',
      },
    ],
  },
  uint64_t: { type: 'number' }, // 64-bit unsigned integer maps to a number
  int64_t: { type: 'number' }, // 64-bit signed integer maps to a number
  HostPort: { type: 'number' }, // HostPort is a number, like 4000
  'std::string': { type: 'string' }, // String type
  bool: { type: 'boolean' }, // Boolean type
};
