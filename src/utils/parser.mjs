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
  DOC_WEB_BASE_PATH,
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
 * Strips the Markdown Heading Prefix and the API Doc Section Heading Prefix
 * of a given Heading
 *
 * @param {string} heading An API doc section Heading
 * @returns {string} A heading without the heading prefix
 */
export const stripHeadingPrefix = heading =>
  heading.replace(/^#{1,5} /i, '').replace(/^(Modules|Class|Event): /, '');

/**
 * Transforms a page title into an unique slug (that can be used as an ID, anchor, or URL)
 * that follows slug conventions defined by the Node.js project
 *
 * @param {string} title The title to be parsed into a slug
 * @returns {string} A title parsed into a page slug
 */
export const transformTitleToSlug = title => {
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
 * @param {import('../types.d.ts').ApiDocMetadata} apiMetadata API Doc Metadata
 * @param {string} type The plain type to be transformed into a Markdown Link
 * @returns {string} The Markdown Link as a string (formatted in Markdown)
 */
export const transformTypeToReferenceLink = (apiMetadata, type) => {
  const typeInput = type.replace('{', '').replace('}', '');

  const typePieces = typeInput.split('|').map(piece => {
    // This is the content to render as the text of the Markdown Link
    const trimmedPiece = piece.trim();

    // This is what we will compare against the API Types Mappings
    const lookupPiece = trimmedPiece.replace(/(?:\[])+$/, '');

    // This is what we return on the Array map uppon a hit, this function
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
      const typeValue = DOC_TYPES_MAPPING_NODE_MODULES[lookupPiece];

      const typeLink = `${DOC_WEB_BASE_PATH}${apiMetadata.version}/${typeValue}`;

      return formatToMarkdownLink(typeLink);
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
 * @param {ReturnType<ReturnType<import('../metadata.mjs')['default']>['newMetadataEntry']>} apiEntryMetadata The current Navigation instance
 * @param {string} yamlString The YAML string to be parsed
 * @returns {import('../types.d.ts').ApiDocRawMetadataEntry}
 */
export const parseYAMLIntoMetadata = (apiEntryMetadata, yamlString) => {
  const cleanContent = yamlString.replace(/YAML| YAML/, '');

  const replacedContent = cleanContent
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
      parsedYaml.update = { type: key, version: parsedYaml[key] };

      delete parsedYaml[key];
    }
  });

  // If there is a `type` key we set the current metadata type to this type
  if (parsedYaml.type && parsedYaml.type.length) {
    apiEntryMetadata.setType(parsedYaml.type);
  }

  apiEntryMetadata.setProperties(parsedYaml);

  const stringifiedYaml = JSON.stringify(parsedYaml);

  return `<!-- ${stringifiedYaml} -->`;
};

/**
 * This method allows us to keep track if we are intersecting code blocks
 * and allows us to skip API Doc Parsing whilst we are inside a code block
 * and prevents other issues from happening
 */
export const calculateCodeBlockIntersection = () => {
  let isIntersecting = false;

  return lines => {
    const linesStartWithCodeBlock = lines.startsWith('```');
    const linesEndsWithCodeBlock = lines.endsWith('```');

    if (linesStartWithCodeBlock) {
      isIntersecting = true;
    }

    if (isIntersecting === true) {
      // This means we're currently iterating inside a code block
      // We should ignore parsing all lines until we reach the
      // end of the code block
      if (linesEndsWithCodeBlock) {
        // If we have a ending code block, stop ignoring the code loop
        // and go back to normal business starting the next block
        isIntersecting = false;
      }
    }

    return isIntersecting;
  };
};
