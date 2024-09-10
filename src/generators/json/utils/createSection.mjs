// @ts-check
'use strict';

import { writeFile } from 'fs/promises';
import { buildHierarchy } from '../../legacy-json/utils/buildHierarchy.mjs';
import { createSectionBaseBuilder } from './createSectionBase.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createSectionBuilder = () => {
  const createSectionBase = createSectionBaseBuilder();

  /**
   * TODO
   * @param {ApiDocMetadataEntry} head The head metadata entry
   * @returns {import('../generated.d.ts').DocumentRoot}
   */
  const createDocumentRoot = head => {
    return {
      source: head.heading.data.text,
    };
  };

  /**
   * Processes children of a given entry and updates the section.
   * @param {HierarchizedEntry} entry - The current entry.
   * @param {import('../types.d.ts').Section | undefined} parent
   */
  const handleChildren = ({ hierarchyChildren }, parent) =>
    hierarchyChildren?.forEach(child => createSection(child, parent));

  /**
   * @param {HierarchizedEntry} entry
   * @param {import('../types.d.ts').Section | undefined} parent
   * @returns {import('../types.d.ts').Section}
   */
  const createSection = (entry, parent) => {
    /**
     * @type {import('../types.d.ts').Section}
     */
    const section = createSectionBase(entry, parent?.type);

    handleChildren(entry, section);

    // switch (section.type) {
    //   case 'module':
    //     createModuleSection(entry, parent, section);
    //     break;
    //   case 'class':
    //     createClassSection(entry, parent, section);
    //     break;
    //   case 'method':
    //     createMethodSection(entry, parent, section);
    //     break;
    //   case 'property':
    //     createPropertySection(entry, parent, section);
    //     break;
    // }

    console.debug('sdaf', section);

    return section;
  };

  /**
   * Builds the module section from head metadata and entries.
   * @param {ApiDocMetadataEntry} head The head metadata entry
   * @param {Array<ApiDocMetadataEntry>} entries The list of metadata entries
   * @returns {import('../generated.d.ts').NodeJsAPIDocumentationSchema}
   */
  return (head, entries) => {
    const entryHierarchy = buildHierarchy(entries);

    if (entryHierarchy.length != 1) {
      throw new TypeError(
        `entryHierarchy.length=${entryHierarchy.length} for ${head.api_doc_source}`
      );
    }

    const documentRoot = createDocumentRoot(head);

    const section = createSection(entryHierarchy[0], undefined);

    if (section.type !== 'module' && section.type !== 'text') {
      throw new TypeError(`expected root section to be a module, got ${section.type} (${head.api_doc_source})`)
    }

    return {
      $schema: './node-doc-schema.json',
      ...documentRoot,
      ...section,
    };
  };
};
