'use strict';

import {
  DOC_API_YAML_KEYS_NAVIGATION,
  DOC_WEB_BASE_PATH,
} from './constants.mjs';
import { stripHeadingPrefix, titleToSlug } from './utils/parser.mjs';

/**
 * This method allows us to handle creation of Navigation Entries
 * for a given file within the API documentation
 *
 * This can be used disconnected with a specific file, and can be aggregated
 * to many files to create a full Navigation for a given version of the API
 *
 * @param {import('./types').ApiDocMetadata}
 */
const createMetadata = ({ version, name }) => {
  const navigationMetadataEntries = [];

  return {
    /**
     * Retrieves all Navigation Entries generated in a said file
     *
     * @returns {Array<import('./types').ApiDocMetadataEntry>}
     */
    getNavigationEntries: () => navigationMetadataEntries,
    newMetadataEntry: () => {
      const internalMetadata = {
        type: undefined,
        heading: undefined,
        properties: {},
      };

      return {
        /**
         * The way how this works is that once we're iterating over each Section within a file
         * Section = a Paragraph (or in other words chunks of text separated by two line breaks)
         * We use our utilities to identify the type of the Section if possible
         * And attempts to find pieces of either the current section or previous sections that are Headings.
         * Within the current Doc specification the Type Metadata could be at least two leves after the heading
         *
         * @param {string} type The API YAML Metadata Type to add to the iteration
         */
        setType: type => {
          internalMetadata.type = type;
        },
        /**
         * Set the Heading Line of a given Metadata
         *
         * @param {Array<string>} lines The current Heading Lines
         */
        setHeading: lines => {
          internalMetadata.heading = lines.split('\n', 1)[0];
        },
        /**
         * Set the Metadata (from YAML if exists) properties to the current Metadata Entry
         *
         * @param {Record<string, string>} properties Extra Metadata Properties to be defined
         */
        setProperties: properties => {
          internalMetadata.properties = properties;
        },
        /**
         * Generates Navigation Entries for the current Navigation Creator
         * and pushes them to the Navigation Entries for the current API file
         *
         * @param {string} content The content of the current Metadata Entry
         * @returns {import('./types').ApiDocMetadataEntry} The locally created Metadata Entries
         */
        create: content => {
          // We want to replace any prefix the Heading might have
          const title = stripHeadingPrefix(internalMetadata.heading);

          // This is the ID of a certain Navigation Entry, which allows us to anchor
          // a certain navigation section to a page ad the exact point of the page (scroll)
          // This is useful for classes, globals and other type of YAML entries, as they reside
          // within a module (page) and we want to link to them directly
          // If the YAML entry is a "module" (aka an API doc file), we don't want to add a hash
          // as the module starts within the page itself
          const slugHash =
            internalMetadata.type !== 'module' ? `#${titleToSlug(title)}` : '';

          const metadataEntry = {
            // Prepends all imported Properties
            ...internalMetadata.properties,
            // The API file name
            name,
            // The Content of an API Section
            content,
            // The unique key of the API Section
            key: `${name}/${slugHash}`,
            // The metadata type of the API Section
            type: internalMetadata.type,
            // The path/slug of the API Section
            slug: `${DOC_WEB_BASE_PATH}${version}/${name}/${slugHash}`,
            // Sanitizes the Heading by replacing certain characters
            // and if the heading has parentheses, uses the portion before the parenthesis
            title: title.split('(')[0].replace(/[^\w\- ]+/g, ''),
          };

          // If this metadata type matches certain predefined types
          // We include it as a Navigation Entry for this API file
          if (DOC_API_YAML_KEYS_NAVIGATION.includes(metadataEntry.type)) {
            navigationMetadataEntries.push(metadataEntry);
          }

          return metadataEntry;
        },
      };
    },
  };
};

export default createMetadata;
