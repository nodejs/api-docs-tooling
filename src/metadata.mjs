'use strict';

import { DOC_API_YAML_KEYS_NAVIGATION } from './constants.mjs';

/**
 * This method allows us to handle creation of Metadata entries
 * within the current scope of API docs being parsed
 *
 * This can be used disconnected with a specific file, and can be aggregated
 * to many files to create a full Navigation for a given version of the API
 *
 * @param {InstanceType<typeof import('github-slugger').default>} slugger A GitHub Slugger
 */
const createMetadata = slugger => {
  const navigationMetadataEntries = [];

  return {
    /**
     * Retrieves all Navigation entries generated in a said file
     *
     * @returns {Array<import('./types').ApiDocNavigationEntry>}
     */
    getNavigationEntries: () => navigationMetadataEntries,
    newMetadataEntry: () => {
      // This holds a temporary buffer of raw metadata before being
      // transformed into NavigationEntries and MetadataEntries
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
         * Set the Heading of a given Metadata
         *
         * @param {import('./types.d.ts').HeadingMetadataEntry} heading The new heading metadata
         */
        setHeading: heading => {
          internalMetadata.heading = heading;
        },
        /**
         * Set the Metadata (from YAML if exists) properties to the current Metadata entry
         * itI also allows for extra data (such as Stability Index) and miscellaneous data to be set
         * although it'd be best to only set ones from {ApiDocRawMetadataEntry}
         *
         * @param {Partial<import('./types.d.ts').ApiDocRawMetadataEntry>} properties Extra Metadata properties to be defined
         */
        updateProperties: properties => {
          internalMetadata.properties = {
            ...internalMetadata.properties,
            ...properties,
          };
        },
        /**
         * Generates a new Navigation entry and pushes them to the internal collection
         * of Navigation entries, and returns a MetadataEntry which is then used by the parser
         * and forwarded to any relevant generator.
         *
         * The Navigation entries has a dedicated separate method for retrieval
         * as it can be manipulated outside of the scope of the generation of the content
         *
         * @param {string} apiDoc The name of the API doc
         * @param {import('vfile').VFile} section The content of the current Metadata entry
         * @returns {import('./types').ApiDocMetadataEntry} The locally created Metadata entries
         */
        create: (apiDoc, section) => {
          // This is the ID of a certain Navigation entry, which allows us to anchor
          // a certain navigation section to a page ad the exact point of the page (scroll)
          // This is useful for classes, globals and other type of YAML entries, as they reside
          // within a module (page) and we want to link to them directly
          const slugHash = `#${slugger.slug(internalMetadata.heading.text)}`;

          const {
            type: yaml_type,
            name: yaml_name,
            source_link,
            stability_index,
            updates = [],
            changes = [],
          } = internalMetadata.properties;

          // We override the type of the heading if we have a YAML type
          internalMetadata.heading.type =
            yaml_type || internalMetadata.heading.type;

          const navigationEntry = {
            // The API file basename (without the extension)
            api: yaml_name || apiDoc,
            // The path/slug of the API section
            slug: `${apiDoc}.html${slugHash}`,
            // The source link of said API section
            sourceLink: source_link,
            // The latest update to an API section
            updates,
            // The full-changeset to an API section
            changes,
            // The Heading metadata
            heading: internalMetadata.heading,
            // The Stability Index of the API section
            stability: stability_index,
          };

          // If this metadata type matches certain predefined types
          // We include it as a Navigation entry for this API file
          if (DOC_API_YAML_KEYS_NAVIGATION.includes(navigationEntry.type)) {
            navigationMetadataEntries.push(navigationEntry);
          }

          // A metadata entry is all the metadata we have about a certain API section
          // with the content being a VFile (Virtual File) containing the Markdown content
          section.data = navigationEntry;

          // Returns the updated VFile with the extra metadata
          return section;
        },
      };
    },
  };
};

export default createMetadata;
