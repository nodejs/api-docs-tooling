'use strict';

import { duplicateStabilityNodes } from './duplicate-stability-nodes.mjs';
import { invalidChangeVersion } from './invalid-change-version.mjs';
import { missingChangeVersion } from './missing-change-version.mjs';
import { missingIntroducedIn } from './missing-introduced-in.mjs';

/**
 * @type {Record<string, import('../types').LintRule>}
 */
export default {
  'duplicate-stability-nodes': duplicateStabilityNodes,
  'invalid-change-version': invalidChangeVersion,
  'missing-change-version': missingChangeVersion,
  'missing-introduced-in': missingIntroducedIn,
};
