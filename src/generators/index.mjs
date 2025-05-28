'use strict';

import jsonSimple from './json-simple/index.mjs';
import legacyHtml from './legacy-html/index.mjs';
import legacyHtmlAll from './legacy-html-all/index.mjs';
import manPage from './man-page/index.mjs';
import legacyJson from './legacy-json/index.mjs';
import legacyJsonAll from './legacy-json-all/index.mjs';
import addonVerify from './addon-verify/index.mjs';
import apiLinks from './api-links/index.mjs';
import oramaDb from './orama-db/index.mjs';
import astJs from './ast-js/index.mjs';
import llmsTxt from './llms-txt/index.mjs';
import jsxAst from './jsx-ast/index.mjs';

export const publicGenerators = {
  'json-simple': jsonSimple,
  'legacy-html': legacyHtml,
  'legacy-html-all': legacyHtmlAll,
  'man-page': manPage,
  'legacy-json': legacyJson,
  'legacy-json-all': legacyJsonAll,
  'addon-verify': addonVerify,
  'api-links': apiLinks,
  'orama-db': oramaDb,
  'llms-txt': llmsTxt,
  'jsx-ast': jsxAst,
};

export const allGenerators = {
  ...publicGenerators,
  // This one is a little special since we don't want it to run unless we need
  // it and we also don't want it to be publicly accessible through the CLI.
  'ast-js': astJs,
};
