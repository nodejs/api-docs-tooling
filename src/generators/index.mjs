'use strict';

import addonVerify from './addon-verify/index.mjs';
import apiLinks from './api-links/index.mjs';
import astJs from './ast-js/index.mjs';
import jsonSimple from './json-simple/index.mjs';
import jsxAst from './jsx-ast/index.mjs';
import legacyHtml from './legacy-html/index.mjs';
import legacyHtmlAll from './legacy-html-all/index.mjs';
import legacyJson from './legacy-json/index.mjs';
import legacyJsonAll from './legacy-json-all/index.mjs';
import llmsTxt from './llms-txt/index.mjs';
import manPage from './man-page/index.mjs';
import metadata from './metadata/index.mjs';
import oramaDb from './orama-db/index.mjs';

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

// These are a bit special: we don't want them to run unless needed,
// and we also don't want them publicly accessible via the CLI.
const internalGenerators = {
  metadata,
  'ast-js': astJs,
};

export const allGenerators = {
  ...publicGenerators,
  ...internalGenerators,
};
