'use strict';

import { u as createTree } from 'unist-builder';

import { compare } from 'semver';

import { DOC_API_UPDATE_MAPPING } from './constants.mjs';
import { coerceSemVer } from './utils/generators.mjs';

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
  /**
   * Maps `updates` into `changes` format, merges them and sorts them by version
   *
   * @param {Array<ApiDocMetadataUpdate>} updates Original updates to be merged
   * @param {Array<ApiDocMetadataChange>} changes Changes to be merged into updates
   * @returns {Array<ApiDocMetadataChange>} Mapped, merged and sorted changes
   */
  const mergeUpdatesIntoChanges = (updates, changes) => {
    // Maps the `updates` array into the same format used by the `changes` array
    // So that for generators such as HTML, we render all the changes + updates
    // into one single list of changes, for example a HTML table
    const mappedUpdatesIntoChanges = updates.map(({ version, type }) => ({
      version,
      'pr-url': undefined,
      description: `${DOC_API_UPDATE_MAPPING[type]}: ${version.join(', ')}`,
    }));

    // Sorts the updates and changes by the first version on a given entry
    return [...mappedUpdatesIntoChanges, ...changes].sort((a, b) =>
      compare(coerceSemVer(a.version[0]), coerceSemVer(b.version[0]))
    );
  };

  /**
   * This holds a temporary buffer of raw metadata before being
   * transformed into NavigationEntries and MetadataEntries
   *
   * @type {{
   *  heading: ApiDocMetadataEntry['heading'],
   *  stability: ApiDocMetadataEntry['stability'],
   *  properties: ApiDocRawMetadataEntry,
   * }}
   */
  const internalMetadata = {
    heading: createTree('root', []),
    stability: createTree('root', []),
    properties: {
      type: undefined,
      source_link: undefined,
      updates: [],
      changes: [],
      tags: [],
    },
  };

  return {
    /**
     * Set the Heading of a given Metadata
     *
     * @param {HeadingMetadataParent} heading The new heading metadata
     */
    setHeading: heading => {
      // We clone the heading to ensure that we don't accidentally override it
      // with later mutations below on the `.create` method
      internalMetadata.heading = { ...heading };
    },
    /**
     * Set the Stability Index of a given Metadata
     *
     * @param {StabilityIndexParent} stability The stability index node to be added
     */
    addStability: stability => {
      // We clone the stability to ensure that we don't accidentally override it
      // with later mutations below on the `.create` method
      internalMetadata.stability.children.push({ ...stability });
    },
    /**
     * Set the Metadata (from YAML if exists) properties to the current Metadata entry
     * it also allows for extra data (such as Stability Index) and miscellaneous data to be set
     * although it'd be best to only set ones from {ApiDocRawMetadataEntry}
     *
     * Note: A single API doc entry might have multiple YAML metadata blocks,
     * meaning that this method can be called multiple times to update the properties
     * and complement each set of data.
     *
     * Note: This ensures only valid properties get defined and that we don't accidentally override
     * values, when we just want to complement them whenever possible.
     *
     * @param {Partial<ApiDocRawMetadataEntry>} properties Extra Metadata properties to be defined
     */
    updateProperties: properties => {
      if (properties.type) {
        internalMetadata.properties.type = properties.type;
        internalMetadata.heading.data.type = properties.type;
      }

      if (properties.source_link) {
        internalMetadata.properties.source_link = properties.source_link;
      }

      if (properties.changes) {
        internalMetadata.properties.changes.push(...properties.changes);
      }

      if (properties.updates) {
        internalMetadata.properties.updates.push(...properties.updates);
      }

      if (properties.tags) {
        internalMetadata.properties.tags.push(...properties.tags);
      }
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
     * @param {ApiDocMetadataEntry['content']} section An AST tree containing the Nodes of the API doc entry section
     * @returns {ApiDocMetadataEntry} The locally created Metadata entries
     */
    create: (apiDoc, section) => {
      // This is the ID of a certain Navigation entry, which allows us to anchor
      // a certain navigation section to a page ad the exact point of the page (scroll)
      // This is useful for classes, globals and other type of YAML entries, as they reside
      // within a module (page) and we want to link to them directly
      const sectionSlug = slugger.slug(internalMetadata.heading.data.text);

      const {
        source_link: sourceLink,
        updates = [],
        changes = [],
        tags = [],
      } = internalMetadata.properties;

      // Also add the slug to the heading data as it is used to build the heading
      internalMetadata.heading.data.slug = sectionSlug;

      // Defines the toJSON method for the Heading AST node to be converted as JSON
      internalMetadata.heading.toJSON = () => internalMetadata.heading.data;

      // Maps the Stability Index AST nodes into a JSON objects from their data properties
      internalMetadata.stability.toJSON = () =>
        internalMetadata.stability.children.map(node => node.data);

      // Returns the Metadata entry for the API doc
      return {
        // The API file basename (without the extension)
        api: apiDoc.stem,
        // The path/slug of the API section
        slug: sectionSlug,
        // The source link of said API section
        sourceLink: sourceLink,
        // The latest updates to an API section
        updates,
        // The full-changeset to an API section
        changes: mergeUpdatesIntoChanges(updates, changes),
        // The Heading metadata
        heading: internalMetadata.heading,
        // The Stability Index of the API section
        stability: internalMetadata.stability,
        // The AST tree of the API section
        content: section,
        // Extra YAML metadata that are Strings
        // and we use to tag special API sections
        tags,
      };
    },
  };
};

export default createMetadata;
