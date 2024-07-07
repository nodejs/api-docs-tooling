'use strict';

import yaml from 'yaml';

import {
  DOC_API_HEADING_TYPES,
  DOC_API_YAML_KEYS_ARRAYS,
  DOC_API_YAML_KEYS_UPDATE,
  DOC_MDN_BASE_URL_JS_GLOBALS,
  DOC_MDN_BASE_URL_JS_PRIMITIVES,
  DOC_TYPES_MAPPING_GLOBALS,
  DOC_TYPES_MAPPING_NODE_MODULES,
  DOC_TYPES_MAPPING_OTHER,
  DOC_TYPES_MAPPING_PRIMITIVES,
} from '../constants.mjs';

/**
 * This method replaces plain text Types within the Markdown content into Markdown links
 * that link to the actual relevant reference for such type (either internal or external link)
 *
 * @param {string} type The plain type to be transformed into a Markdown Link
 * @returns {string} The Markdown Link as a string (formatted in Markdown)
 */
export const transformTypeToReferenceLink = type => {
  const typeInput = type.replace('{', '').replace('}', '');

  /**
   * Handles the Mapping (if there's a match) of the input text
   * into the reference type from the API Docs
   *
   * @param {string} lookupPiece
   */
  const transformType = lookupPiece => {
    // Transform JS Primitive Type references into Markdown Links (MDN)
    if (lookupPiece.toLowerCase() in DOC_TYPES_MAPPING_PRIMITIVES) {
      const typeValue = DOC_TYPES_MAPPING_PRIMITIVES[lookupPiece.toLowerCase()];

      return `${DOC_MDN_BASE_URL_JS_PRIMITIVES}#${typeValue}_type`;
    }

    // Transforms JS Global Type references into Markdown Links (MDN)
    if (lookupPiece in DOC_TYPES_MAPPING_GLOBALS) {
      return `${DOC_MDN_BASE_URL_JS_GLOBALS}${lookupPiece}`;
    }

    // Transform other external Web/JavaScript Type references into Markdown Links
    // to diverse different external websites. These already are formatted as links
    if (lookupPiece in DOC_TYPES_MAPPING_OTHER) {
      return DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];
    }

    // Transform Node.js Type/Module references into Markdown Links
    // that refer to other API Docs pages within the Node.js API docs
    if (lookupPiece in DOC_TYPES_MAPPING_NODE_MODULES) {
      return DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];
    }

    return undefined;
  };

  const typePieces = typeInput.split('|').map(piece => {
    // This is the content to render as the text of the Markdown Link
    const trimmedPiece = piece.trim();

    // This is what we will compare against the API Types Mappings
    const result = transformType(trimmedPiece.replace(/(?:\[])+$/, ''));

    return result ? `[\`${trimmedPiece}\`](${result})` : undefined;
  });

  // Filter out pieces that we failed to Map and then join the valid ones
  // into different links separated by a `|`
  const markdownLinks = typePieces.filter(Boolean).join(' | ');

  // Return the replaced links or the original content if they all failed to be replaced
  // Note that if some failed to get replaced, only the valid ones will be returned
  // NOTE: Based on the original code, we don't seem to care when we fail specific entries to be replaced
  // although I believe this should be revisited and either show the original type content or show a warning
  return markdownLinks || typeInput;
};

/**
 * Parses Markdown YAML source into a JavaScript object containing all the metadata
 * (this is forwarded to the parser so it knows what to do with said metadata)
 *
 * @param {string} yamlString The YAML string to be parsed
 * @returns {import('../types.d.ts').ApiDocRawMetadataEntry} The parsed YAML Metadata
 */
export const parseYAMLIntoMetadata = yamlString => {
  const replacedContent = yamlString
    // special validations for some non-cool formatted properties
    // of the docs schema
    .replace('introduced_in=', 'introduced_in: ')
    .replace('source_link=', 'source_link: ')
    .replace('type=', 'type: ')
    .replace('name=', 'name: ');

  // Ensures that the parsed YAML is an object, because even if it is not
  // i.e. a plain string or an array, it will simply not result into anything
  const parsedYaml = Object(yaml.parse(replacedContent));

  // This cleans up the YAML metadata into something more standardized
  Object.keys(parsedYaml).forEach(key => {
    // Some entries should always be Array for the sake of consistency
    if (DOC_API_YAML_KEYS_ARRAYS.includes(key)) {
      parsedYaml[key] = [parsedYaml[key]].flat();
    }

    // We transform some entries in a standardized "updates" field
    // and then remove them from the parsedYaml
    if (DOC_API_YAML_KEYS_UPDATE.includes(key)) {
      parsedYaml.updates = [{ type: key, version: parsedYaml[key] }];

      delete parsedYaml[key];
    }
  });

  return parsedYaml;
};

/**
 * Parses a raw Heading string into Heading Metadata
 *
 * @param {string} heading The raw Heading Text
 * @param {number} depth The depth of the heading
 * @returns {import('../types.d.ts').HeadingMetadataEntry} Parsed Heading Entry
 */
export const parseHeadingIntoMetadata = (heading, depth) => {
  for (const { type, regex } of DOC_API_HEADING_TYPES) {
    // Attempts to get a match from one of the Heading Tyoes, if a match is found
    // we use that type as the heading type, and extract the regex expression match group
    // which should be the inner "plain" heading content (or the title of the heading for navigation)
    const [, innerHeading] = heading.match(regex) ?? [];

    if (innerHeading && innerHeading.length) {
      return { text: heading, type, name: innerHeading, depth };
    }
  }

  return { text: heading, type: 'module', name: heading, depth };
};
