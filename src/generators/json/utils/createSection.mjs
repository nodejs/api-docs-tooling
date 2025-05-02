// @ts-check
'use strict';

import { buildHierarchy } from '../../legacy-json/utils/buildHierarchy.mjs';
import { createSectionBaseBuilder } from './createSectionBase.mjs';
import { createModuleSectionBuilder } from './createModuleSection.mjs';
import { createClassSectionBuilder } from './createClassSection.mjs';
import { createMethodSectionBuilder } from './createMethodSection.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createSectionBuilder = () => {
  const createSectionBase = createSectionBaseBuilder();
  const createModuleSection = createModuleSectionBuilder();
  const createClassSection = createClassSectionBuilder();
  const createMethodSection = createMethodSectionBuilder();

  /**
   * TODO docs
   * @param {ApiDocMetadataEntry} head The head metadata entry
   * @returns {import('../generated.d.ts').DocumentRoot}
   */
  const createDocumentRoot = head => {
    return {
      source: head.api_doc_source,
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
    const section = (createSectionBase(entry, parent?.type));

    section.parent = parent;

    switch (section.type) {
      case 'module':
        createModuleSection(entry, section);
        break;
      case 'class':
        createClassSection(section);
        break;
      case 'method':
        createMethodSection(entry, section);
        break;
      case 'property':
        // createPropertySection(entry, parent, section);
        break;
      case 'text':
        if (parent) {
          parent.text ??= [];

          parent.text.push(section);
        }

        break;
      default:
        throw new TypeError(`unhandled section type ${section.type}`);
    }

    handleChildren(entry, section);

    delete section.parent;

    // if (parent) {
    //   if (!parent.tmp) {
    //     parent.tmp = [];
    //   }
    //   parent.tmp.push(section);
    // }
    // console.debug(section);

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
      throw new TypeError(`${head.api_doc_source} has multiple root elements`);
    }

    const documentRoot = createDocumentRoot(head);

    const section = createSection(entryHierarchy[0], undefined);

    if (section.type !== 'module' && section.type !== 'text') {
      throw new TypeError(
        `expected root section to be a module or text, got ${section.type} (${head.api_doc_source})`
      );
    }

    return {
      // $schema: `https://nodejs.org/dist/${DOC_NODE_VERSION}/doc/api/node-doc-schema.json`
      $schema: './node-doc-schema.json',
      ...documentRoot,
      ...section,
    };
  };
};
