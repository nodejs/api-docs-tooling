'use strict';

import { h as createElement } from 'hastscript';

import { toString } from 'hast-util-to-string';
import { SKIP, visit } from 'unist-util-visit';

import { getSingletonHighlighterCore } from '@shikijs/core';

import shikiConfig from '../../shiki.config.mjs';

// This is what Remark will use as prefix within a <pre> className
// to attribute the current language of the <pre> element
const languagePrefix = 'language-';

// Creates a Singleton instance for Shiki's syntax highlighter using WASM
const shikiHighlighter = await getSingletonHighlighterCore(shikiConfig);

// Creates a static button element which is used for the "copy" button
// within codeboxes for copying the code to the clipboard
const copyButtonElement = createElement(
  'button',
  { class: 'copy-button' },
  'copy'
);

/**
 * Checks if the given node is a valid code element.
 *
 * @param {import('unist').Node} node - The node to be verified.
 *
 * @return {boolean} - True when it is a valid code element, false otherwise.
 */
function isCodeBlock(node) {
  return Boolean(
    node?.tagName === 'pre' && node?.children[0].tagName === 'code'
  );
}

/**
 * Creates a HAST transformer for Shiki which is used for transforming our codeboxes
 *
 * @type {import('unified').Plugin}
 */
export default function rehypeShikiji() {
  /**
   * @param {import('hast').Root} tree - The HAST tree to be transformed.
   */
  return function (tree) {
    visit(tree, 'element', (node, index, parent) => {
      // We only want to process <pre>...</pre> elements
      if (!parent || index == null || node.tagName !== 'pre') {
        return;
      }

      // We want the contents of the <pre> element, hence we attempt to get the first child
      const preElement = node.children[0];

      // If thereÄs nothing inside the <pre> element... What are we doing here?
      if (!preElement || !preElement.properties) {
        return;
      }

      // Ensure that we're not visiting a <code> element but it's inner contents
      // (keep iterating further down until we reach where we want)
      if (preElement.type !== 'element' || preElement.tagName !== 'code') {
        return;
      }

      // Get the <pre> element class names
      const preClassNames = preElement.properties.className;

      // The current classnames should be an array and it should have a length
      if (typeof preClassNames !== 'object' || preClassNames.length === 0) {
        return;
      }

      // We want to retrieve the language class name from the class names
      const codeLanguage = preClassNames.find(
        c => typeof c === 'string' && c.startsWith(languagePrefix)
      );

      // If we didn't find any `language-` classname then we shouldn't highlight
      if (typeof codeLanguage !== 'string') {
        return;
      }

      // Retrieve the whole <pre> contents as a parsed DOM string
      const preElementContents = toString(preElement);

      // Grabs the relevant alias/name of the language
      const languageId = codeLanguage.slice(languagePrefix.length);

      // Parses the <pre> contents and returns a HAST tree with the highlighted code
      const { children } = shikiHighlighter.codeToHast(preElementContents, {
        lang: languageId,
        theme: shikiConfig.theme,
      });

      // Adds the original language back to the <pre> element
      children[0].properties.class = `${children[0].properties.class} ${codeLanguage}`;

      // Adds the "copy" button to the <pre> element
      children[0].children.push(copyButtonElement);

      // Replaces the <pre> element with the updated one
      parent.children.splice(index, 1, ...children);
    });

    visit(tree, 'element', (_, index, parent) => {
      const languages = [];
      const codeElements = [];

      let currentIndex = index;

      while (isCodeBlock(parent?.children[currentIndex])) {
        const preElement = parent?.children[currentIndex];
        const codeElement = preElement.children[0];

        // We should get the language name from the class name
        if (preElement.properties.class?.length) {
          const className = preElement.properties.class;
          const matches = className.match(/language-(?<language>.*)/);
          const language = matches?.groups.language ?? 'text';

          // For this iteration of our code, we only support multi-code tab for
          // JavaScript languages for Node.js (CJS / MJS)
          if (language === 'cjs' || language === 'mjs') {
            // Add the language to the languages array
            languages.push(language);

            // We patch up Shiki's `pre` element properties into the `code` element
            // since we want to keep the original properties
            codeElement.properties.class = `${className} ${language}`;
            codeElement.properties.style = preElement.properties.style;

            // Add the code element to the pre children
            codeElements.push(codeElement);
          }
        }

        const nextNode = parent?.children[currentIndex + 1];

        // If the CodeBoxes are on the root tree the next Element will be
        // an empty text element so we should skip it
        currentIndex += nextNode && nextNode?.type === 'text' ? 2 : 1;
      }

      // Since we only support CJS/MJS switch, we should have exactly 2 elements
      // in order to create a switchable code tab
      if (languages.length === 2) {
        const codeTabElement = createElement(
          'pre',
          {
            // We grab Shiki's styling from the code tag
            // back to the pre element tag to ensure consistency
            style: codeElements[0].properties.style,
          },
          [
            createElement('input', {
              class: 'js-flavor-toggle',
              type: 'checkbox',
              checked: languages[0] === 'cjs',
            }),
            ...codeElements,
            copyButtonElement,
          ]
        );

        // This removes all the original code Elements and adds a new CodeTab Element
        // at the original start of the first Code Element
        parent.children.splice(index, currentIndex - index, codeTabElement);

        // Prevent visiting the code block children and for the next N Elements
        // since all of them belong to this CodeTabs Element
        return [SKIP];
      }
    });
  };
}
