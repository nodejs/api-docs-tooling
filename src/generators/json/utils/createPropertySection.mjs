// @ts-check
'use strict';

import { findParentSection } from './findParentSection.mjs';

/**
 * @typedef {import('../../legacy-json/types.d.ts').HierarchizedEntry} HierarchizedEntry
 */

export const createPropertySectionBuilder = () => {
  /**
   * TODO docs
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Property} section The method section
   */
  const parseType = (entry, section) => {
    const [, ...nodes] = entry.content.children;

    // The first list that exists in the entry should be its type info
    const listNode = nodes.find(node => node.type === 'list');

    if (!listNode) {
      // No type information, default to `any`
      return;
    }

    const firstListElement = listNode.children[0].children[0];

    if (firstListElement.type !== 'paragraph') {
      throw new TypeError(
        `expected first node in property type list node to be a paragraph, got ${firstListElement.type}`
      );
    }

    // Should look something like these in the Markdown source:
    // {integer} **Default:** 8192
    // {integer} bla bla bla
    // {boolean}
    // Text: {Function} bla bla bla
    let typeNode = firstListElement.children[0];

    /**
     * @param {import('mdast').Link} node
     */
    const parseTypeFromLink = node => {
      const { type, value } = node.children[0];

      if (type !== 'inlineCode') {
        throw new TypeError(
          `unexpected link node child type ${type} for property ${section['@name']}`
        );
      }

      let formattedValue = value;
      if (formattedValue.startsWith('<')) {
        formattedValue = formattedValue.substring(1, formattedValue.length - 1);
      }

      // TODO if this is a native type, make sure it's correct
      //  (bigint -> BigInt, integer -> number/BigInt or whatever)
      section['@type'] = formattedValue;
    };

    switch (typeNode.type) {
      case 'link': {
        parseTypeFromLink(typeNode);

        break;
      }
      case 'text': {
        if (typeNode.value !== 'Type: ') {
          break;
        }

        typeNode = firstListElement.children[1];

        if (typeNode.type === 'link') {
          parseTypeFromLink(typeNode);
        }

        break;
      }
      default: {
        // Not something that we can get a type from
        break;
      }
    }
  };

  /**
   * Adds the properties expected in a method section to an object.
   * @param {HierarchizedEntry} entry The AST entry
   * @param {import('../generated.d.ts').Property} section The method section
   */
  return (entry, section) => {
    // console.log(JSON.stringify(entry, null, 2));

    // TODO how to tell if it's mutable?
    parseType(entry, section);

    const parent = findParentSection(section, ['class', 'module']);

    // Add this section to the parent if it exists
    if (parent) {
      parent.properties.push(section);
    }
  };
};
