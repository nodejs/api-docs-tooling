'use strict';

import yaml from 'yaml';

import {
  DOC_API_SLUGS_REPLACEMENTS,
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
 * All YAML values are treated as an array for consistency
 * since they get rendered within a table of changelog
 *
 * @param {string|Array<string>} value YAML metadata entry value
 * @returns {Array<string>} YAML metadata entry value as an Array
 */
export const yamlValueToArray = value =>
  Array.isArray(value) ? value : [value];

/**
 * Transforms a page title into an unique slug (that can be used as an ID, anchor, or URL)
 * that follows slug conventions defined by the Node.js project
 *
 * @param {string} title The title to be parsed into a slug
 * @returns {string} A title parsed into a page slug
 */
export const stringToSlug = title => {
  let slug = title.toLowerCase().trim();

  DOC_API_SLUGS_REPLACEMENTS.forEach(set => {
    slug = slug.replace(set.from, set.to);
  });

  return (
    slug
      // This escape is actually needed here
      // eslint-disable-next-line no-useless-escape
      .replace(/[^\w\-]+/g, '') // Remove any non word characters
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-/, '') // Remove any leading hyphen
      .replace(/-$/, '') // Remove any trailing hyphen
  );
};

/**
 * This method replaces plain text Types within the Markdown content into Markdown links
 * that link to the actual relevant reference for such type (either internal or external link)
 *
 * @param {string} type The plain type to be transformed into a Markdown Link
 * @returns {string} The Markdown Link as a string (formatted in Markdown)
 */
export const transformTypeToReferenceLink = type => {
  const typeInput = type.replace('{', '').replace('}', '');

  const typePieces = typeInput.split('|').map(piece => {
    // This is the content to render as the text of the Markdown Link
    const trimmedPiece = piece.trim();

    // This is what we will compare against the API Types Mappings
    const lookupPiece = trimmedPiece.replace(/(?:\[])+$/, '');

    // This is what we return on the Array map upon a hit, this function
    // is just for making this formatting reusable
    const formatToMarkdownLink = result => `[\`${trimmedPiece}\`](${result})`;

    // Transform JS Primitive Type references into Markdown Links (MDN)
    if (lookupPiece.toLowerCase() in DOC_TYPES_MAPPING_PRIMITIVES) {
      const typeValue = DOC_TYPES_MAPPING_PRIMITIVES[lookupPiece.toLowerCase()];

      const typeLink = `${DOC_MDN_BASE_URL_JS_PRIMITIVES}#${typeValue}_type`;

      return formatToMarkdownLink(typeLink);
    }

    // Transforms JS Global Type references into Markdown Links (MDN)
    if (lookupPiece in DOC_TYPES_MAPPING_GLOBALS) {
      const typeLink = `${DOC_MDN_BASE_URL_JS_GLOBALS}${lookupPiece}`;

      return formatToMarkdownLink(typeLink);
    }

    // Transform other external Web/JavaScript Type references into Markdown Links
    // to diverse different external websites. These already are formatted as links
    if (lookupPiece in DOC_TYPES_MAPPING_OTHER) {
      const typeValueAsLink = DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];

      return formatToMarkdownLink(typeValueAsLink);
    }

    // Transform Node.js Type/Module references into Markdown Links
    // that refer to other API Docs pages within the Node.js API docs
    if (lookupPiece in DOC_TYPES_MAPPING_NODE_MODULES) {
      const typeValueAsLink = DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];

      return formatToMarkdownLink(typeValueAsLink);
    }

    return undefined;
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
      parsedYaml[key] = yamlValueToArray(parsedYaml[key]);
    }

    if (DOC_API_YAML_KEYS_UPDATE.includes(key)) {
      // We transform some entries in a standardized "updates" field
      parsedYaml.updates = [{ type: key, version: parsedYaml[key] }];

      delete parsedYaml[key];
    }
  });

  return parsedYaml;
};

/**
 * Parses a raw Heading String into Heading Metadata
 *
 * @param {string} heading The raw Heading Text
 * @param {number} depth The depth of the heading
 * @returns {import('../types.d.ts').HeadingMetadataEntry} Parsed Heading Entry
 */
export const parseHeadingIntoMetadata = (heading, depth) => {
  const r = String.raw;

  const eventPrefix = '^Event: +';
  const classPrefix = '^Class: +';
  const ctorPrefix = '^(?:Constructor: +)?`?new +';
  const classMethodPrefix = '^Static method: +';
  const maybeClassPropertyPrefix = '(?:Class property: +)?';

  const maybeQuote = '[\'"]?';
  const notQuotes = '[^\'"]+';

  const maybeBacktick = '`?';

  // To include constructs like `readable\[Symbol.asyncIterator\]()`
  // or `readable.\_read(size)` (with Markdown escapes).
  const simpleId = r`(?:(?:\\?_)+|\b)\w+\b`;
  const computedId = r`\\?\[[\w\.]+\\?\]`;
  const id = `(?:${simpleId}|${computedId})`;
  const classId = r`[A-Z]\w+`;

  const ancestors = r`(?:${id}\.?)+`;
  const maybeAncestors = r`(?:${id}\.?)*`;

  const callWithParams = r`\([^)]*\)`;

  const maybeExtends = `(?: +extends +${maybeAncestors}${classId})?`;

  const headingTypes = {
    event: `${eventPrefix}${maybeBacktick}${maybeQuote}(${notQuotes})${maybeQuote}${maybeBacktick}$`,
    class: `${classPrefix}${maybeBacktick}(${maybeAncestors}${classId})${maybeExtends}${maybeBacktick}$`,
    ctor: `${ctorPrefix}(${maybeAncestors}${classId})${callWithParams}${maybeBacktick}$`,
    classMethod: `${classMethodPrefix}${maybeBacktick}${maybeAncestors}(${id})${callWithParams}${maybeBacktick}$`,
    method: `^${maybeBacktick}${maybeAncestors}(${id})${callWithParams}${maybeBacktick}$`,
    property: `^${maybeClassPropertyPrefix}${maybeBacktick}${ancestors}(${id})${maybeBacktick}$`,
  };

  for (const headingType in headingTypes) {
    const result = heading.match(new RegExp(headingTypes[headingType]));

    if (result && result.length >= 2) {
      return { text: heading, type: headingType, name: result[1], depth };
    }
  }

  return { text: heading, type: 'module', name: heading, depth };
};
