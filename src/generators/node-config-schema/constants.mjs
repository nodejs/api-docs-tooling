// Error Messages
export const ERRORS = {
  missingCCandHFiles:
    'Both node_options.cc and node_options.h must be provided.',
  headerTypeNotFound:
    'A type for "{{headerKey}}" not found in the header file.',
  missingTypeDefinition: 'No type schema found for "{{type}}".',
};

// Regex pattern to match calls to the AddOption function.
export const ADD_OPTION_REGEX =
  /AddOption[\s\n\r]*\([\s\n\r]*"([^"]+)"(.*?)\);/gs;

// Regex pattern to match header keys in the Options class.
export const OPTION_HEADER_KEY_REGEX = /Options::(\w+)/;
