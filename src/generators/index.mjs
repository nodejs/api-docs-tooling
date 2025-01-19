'use strict';

import jsonSimple from './json-simple/index.mjs';
import legacyHtml from './legacy-html/index.mjs';
import legacyHtmlAll from './legacy-html-all/index.mjs';
import manPage from './man-page/index.mjs';
import legacyJson from './legacy-json/index.mjs';
import legacyJsonAll from './legacy-json-all/index.mjs';
import addonVerify from './addon-verify/index.mjs';

export default {
  'json-simple': jsonSimple,
  'legacy-html': legacyHtml,
  'legacy-html-all': legacyHtmlAll,
  'man-page': manPage,
  'legacy-json': legacyJson,
  'legacy-json-all': legacyJsonAll,
  'addon-verify': addonVerify,
};
