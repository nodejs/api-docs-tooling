'use strict';

import { h as createElement } from 'hastscript';

import { getWasmInstance } from '@shikijs/core/wasm-inlined';

import cLanguage from 'shiki/langs/c.mjs';
import coffeeScriptLanguage from 'shiki/langs/coffeescript.mjs';
import cPlusPlusLanguage from 'shiki/langs/cpp.mjs';
import diffLanguage from 'shiki/langs/diff.mjs';
import dockerLanguage from 'shiki/langs/docker.mjs';
import httpLanguage from 'shiki/langs/http.mjs';
import javaScriptLanguage from 'shiki/langs/javascript.mjs';
import jsonLanguage from 'shiki/langs/json.mjs';
import powershellLanguage from 'shiki/langs/powershell.mjs';
import shellScriptLanguage from 'shiki/langs/shellscript.mjs';
import shellSessionLanguage from 'shiki/langs/shellsession.mjs';
import typeScriptLanguage from 'shiki/langs/typescript.mjs';

import shikiNordTheme from 'shiki/themes/nord.mjs';

// Creates a static button element which is used for the "copy" button
// within codeboxes for copying the code to the clipboard
const copyButtonElement = createElement(
  'button',
  { class: 'copy-button' },
  createElement('text', 'copy')
);

/**
 * @TODO: Use `shiki.config.mjs` from nodejs/nodejs.org
 *
 * Creates a Shiki configuration for the API Docs tooling
 *
 * @type {import('@shikijs/core').HighlighterCoreOptions}
 */
export default {
  loadWasm: getWasmInstance,
  theme: shikiNordTheme,
  langs: [
    { ...javaScriptLanguage[0], aliases: ['mjs', 'cjs', 'js'] },
    ...jsonLanguage,
    ...typeScriptLanguage,
    ...shellScriptLanguage,
    ...powershellLanguage,
    ...shellSessionLanguage,
    ...dockerLanguage,
    ...diffLanguage,
    ...cLanguage,
    ...cPlusPlusLanguage,
    ...httpLanguage,
    ...coffeeScriptLanguage,
  ],
  transformers: [
    // Adds the "copy" button to the `pre` element
    { pre: node => void node.children.push(copyButtonElement) },
  ],
};
