'use strict';

import { deprecationCodeOrder } from './deprecation-code-order.mjs';
import { invalidChangeVersion } from './invalid-change-version.mjs';
import { missingChangeVersion } from './missing-change-version.mjs';
import { missingIntroducedIn } from './missing-introduced-in.mjs';

/**
 * @type {Record<string, import('../types').LintRule>}
 */
export default {
  'invalid-change-version': invalidChangeVersion,
  'missing-change-version': missingChangeVersion,
  'missing-introduced-in': missingIntroducedIn,
  'deprecation-code-order': deprecationCodeOrder,
};
