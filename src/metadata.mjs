'use strict';

/**
 * This method allows us to handle creation of Metadata entries
 * within the current scope of API docs being parsed
 *
 * This can be used disconnected with a specific file, and can be aggregated
 * to many files to create a full Navigation for a given version of the API
 *
 * @param {InstanceType<typeof import('github-slugger').default>} slugger A GitHub Slugger
 * @param {ReturnType<typeof remark>} remarkProcessor A Remark processor
 */
const createMetadata = (slugger, remarkProcessor) => {
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
     * it also allows for extra data (such as Stability Index) and miscellaneous data to be set
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
     * @param {import('vfile').VFile} apiDoc The API doc file being parsed
     * @param {import('unist').Parent} section An AST tree containing the Nodes of the API doc entry section
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

      const apiEntryMetadata = {
        // The API file basename (without the extension)
        api: yaml_name || apiDoc.stem,
        // The path/slug of the API section
        slug: `${apiDoc.stem}.html${slugHash}`,
        // The source link of said API section
        sourceLink: source_link,
        // The latest updates to an API section
        updates,
        // The full-changeset to an API section
        changes,
        // The Heading metadata
        heading: internalMetadata.heading,
        // The Stability Index of the API section
        stability: stability_index,
        // The AST tree of the API section
        content: section,
      };

      // Returns the Metadata entry for the API doc
      return {
        // Appends the base Metadata entry
        ...apiEntryMetadata,

        // Overrides the toJSON method to allow for custom serialization
        toJSON: () => ({
          ...apiEntryMetadata,

          // We stringify the AST tree to a string
          // since this is what we wanbt to render within a JSON object
          content: remarkProcessor.stringify(section),
        }),
      };
    },
  };
};

export default createMetadata;
