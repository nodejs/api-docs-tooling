'use strict';

import { DOC_API_YAML_KEYS_NAVIGATION } from './constants.mjs';
import { stringToSlug } from './utils/parser.mjs';

/**
 * This method allows us to handle creation of Navigation Entries
 * for a given file within the API documentation
 *
 * This can be used disconnected with a specific file, and can be aggregated
 * to many files to create a full Navigation for a given version of the API
 */
const createMetadata = () => {
  const navigationMetadataEntries = [];

  return {
    /**
     * Retrieves all Navigation Entries generated in a said file
     *
     * @returns {Array<import('./types').ApiDocNavigationEntry>}
     */
    getNavigationEntries: () => navigationMetadataEntries,
    newMetadataEntry: () => {
      const internalMetadata = {
        heading: {
          text: undefined,
          type: undefined,
          name: undefined,
          depth: -1,
        },
        properties: {},
      };

      return {
        /**
         * Set the Heading Line of a given Metadata
         *
         * @param {import('./types.d.ts').HeadingMetadataEntry} heading The new Heading Metadata
         */
        setHeading: heading => {
          internalMetadata.heading = heading;
        },
        /**
         * Set the Metadata (from YAML if exists) properties to the current Metadata Entry
         *
         * @param {import('./types.d.ts').ApiDocRawMetadataEntry} properties Extra Metadata Properties to be defined
         */
        setProperties: properties => {
          internalMetadata.properties = properties;

          if (properties.type) {
            internalMetadata.type = properties.type;
          }
        },
        /**
         * Generates Navigation Entries for the current Navigation Creator
         * and pushes them to the Navigation Entries for the current API file
         *
         * @param {string} apiDoc The name of the API Doc
         * @param {import('vfile').VFile} section The content of the current Metadata Entry
         * @returns {import('./types').ApiDocMetadataEntry} The locally created Metadata Entries
         */
        create: (apiDoc, section) => {
          // This is the ID of a certain Navigation Entry, which allows us to anchor
          // a certain navigation section to a page ad the exact point of the page (scroll)
          // This is useful for classes, globals and other type of YAML entries, as they reside
          // within a module (page) and we want to link to them directly
          const slugHash = `#${stringToSlug(internalMetadata.heading.text)}`;

          const {
            type: yamlType,
            name: yamlName,
            source_link,
            updates = [],
            changes = [],
          } = internalMetadata.properties;

          // We override the type of the heading if we have a YAML type
          internalMetadata.heading.type =
            yamlType || internalMetadata.heading.type;

          const navigationEntry = {
            // The API file Basename (without the Extension)
            api: yamlName || apiDoc,
            // The path/slug of the API Section
            slug: `${apiDoc}.html${slugHash}`,
            // The Source Link of said API Section
            sourceLink: source_link,
            // The latest update to an API Section
            updates,
            // The full-changeset to an API Section
            changes,
            // The Heading Metadata
            heading: internalMetadata.heading,
          };

          // If this metadata type matches certain predefined types
          // We include it as a Navigation Entry for this API file
          if (DOC_API_YAML_KEYS_NAVIGATION.includes(navigationEntry.type)) {
            navigationMetadataEntries.push(navigationEntry);
          }

          // A metadata entry is all the metadata we have about a certain API Section
          // with the content being a VFile (Virtual File) containing the Markdown content
          section.data = navigationEntry;

          // Returns the updated VFile with the extra Metadata
          return section;
        },
      };
    },
  };
};

export default createMetadata;
