'use strict';

import yaml from 'yaml';

import {
  DOC_API_HEADING_TYPES,
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
 * @param {string} type The plain type to be transformed into a Markdown link
 * @returns {string} The Markdown link as a string (formatted in Markdown)
 */
export const transformTypeToReferenceLink = type => {
  const typeInput = type.replace('{', '').replace('}', '');

  /**
   * Handles the mapping (if there's a match) of the input text
   * into the reference type from the API docs
   *
   * @param {string} lookupPiece
   * @returns {string | undefined} The reference URL or undefined if no match was found
   */
  const transformType = lookupPiece => {
    // Transform JS primitive type references into Markdown links (MDN)
    if (lookupPiece.toLowerCase() in DOC_TYPES_MAPPING_PRIMITIVES) {
      const typeValue = DOC_TYPES_MAPPING_PRIMITIVES[lookupPiece.toLowerCase()];

      return `${DOC_MDN_BASE_URL_JS_PRIMITIVES}#${typeValue}_type`;
    }

    // Transforms JS Global type references into Markdown links (MDN)
    if (lookupPiece in DOC_TYPES_MAPPING_GLOBALS) {
      return `${DOC_MDN_BASE_URL_JS_GLOBALS}${lookupPiece}`;
    }

    // Transform other external Web/JavaScript type references into Markdown links
    // to diverse different external websites. These already are formatted as links
    if (lookupPiece in DOC_TYPES_MAPPING_OTHER) {
      return DOC_TYPES_MAPPING_OTHER[lookupPiece];
    }

    // Transform Node.js type/module references into Markdown links
    // that refer to other API docs pages within the Node.js API docs
    if (lookupPiece in DOC_TYPES_MAPPING_NODE_MODULES) {
      return DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];
    }

    return undefined;
  };

  const typePieces = typeInput.split('|').map(piece => {
    // This is the content to render as the text of the Markdown link
    const trimmedPiece = piece.trim();

    // This is what we will compare against the API types mappings
    const result = transformType(trimmedPiece.replace(/(?:\[])+$/, ''));

    return result && `[\`<${trimmedPiece}>\`](${result})`;
  });

  // Filter out pieces that we failed to map and then join the valid ones
  // into different links separated by a `|`
  const markdownLinks = typePieces.filter(Boolean).join(' | ');

  // Return the replaced links or the original content if they all failed to be replaced
  // Note that if some failed to get replaced, only the valid ones will be returned
  // NOTE: Based on the original code, we don't seem to care when we fail specific entries to be replaced
  // although I believe this should be revisited and either show the original type content or show a warning
  return markdownLinks || type;
};

/**
 * Parses Markdown YAML source into a JavaScript object containing all the metadata
 * (this is forwarded to the parser so it knows what to do with said metadata)
 *
 * @param {string} yamlString The YAML string to be parsed
 * @returns {ApiDocRawMetadataEntry} The parsed YAML metadata
 */
export const parseYAMLIntoMetadata = yamlString => {
  const replacedContent = yamlString
    // special validations for some non-cool formatted properties of the docs schema
    .replace('introduced_in=', 'introduced_in: ')
    .replace('source_link=', 'source_link: ')
    .replace('type=', 'type: ')
    .replace('name=', 'name: ');

  // Ensures that the parsed YAML is an object, because even if it is not
  // i.e. a plain string or an array, it will simply not result into anything
  /** @type {ApiDocRawMetadataEntry} */
  const parsedYaml = yaml.parse(replacedContent);

  // Ensure that only Objects get parsed on Object.keys(), since some `<!--`
  // comments, might be just plain strings and not even a valid YAML metadata
  if (typeof parsedYaml !== 'object') {
    return {};
  }

  // This cleans up the YAML metadata into something more standardized and that
  // can be consumed by our metadata parser
  Object.keys(parsedYaml).forEach(key => {
    // We normalise entries from the `changes` object, ensuring that
    // the versions property is always an array
    if (key === 'changes' && Array.isArray(parsedYaml[key])) {
      // The `changes` entry must always be an array of objects
      // if that's not the case, we should report a warning in the future
      parsedYaml[key] = parsedYaml[key].map(change => ({
        ...change,
        version: [change.version].flat(),
      }));
    }

    // We transform some entries in a standardized "updates" field
    // and then remove them from the parsedYaml
    if (DOC_API_YAML_KEYS_UPDATE.includes(key)) {
      // We ensure that the `updates` is an array of objects; Within `metadata.mjs`
      // we actually merge these different arrays, into one single array,
      // differently from `changes` the `updates` are scattered through the API section
      // and need to be merged together into one big `updates` array
      parsedYaml.updates = [{ type: key, version: [parsedYaml[key]].flat() }];

      // We remove the original entry, as it is becoming a `updates` entry
      delete parsedYaml[key];
    }
  });

  return parsedYaml;
};

/**
 * Parses a raw Heading string into Heading metadata
 *
 * @param {string} heading The raw Heading text
 * @param {number} depth The depth of the heading
 * @returns {HeadingMetadataEntry} Parsed Heading entry
 */
export const parseHeadingIntoMetadata = (heading, depth) => {
  for (const { type, regex } of DOC_API_HEADING_TYPES) {
    // Attempts to get a match from one of the heading types, if a match is found
    // we use that type as the heading type, and extract the regex expression match group
    // which should be the inner "plain" heading content (or the title of the heading for navigation)
    const [, innerHeading] = heading.match(regex) ?? [];

    if (innerHeading && innerHeading.length) {
      return { text: heading, type, name: innerHeading, depth };
    }
  }

  return { text: heading, type: 'module', name: heading, depth };
};
