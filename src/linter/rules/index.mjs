'use strict';

import { duplicateStabilityNodes } from './duplicate-stability-nodes.mjs';
import { invalidChangeVersion } from './invalid-change-version.mjs';
import { missingIntroducedIn } from './missing-introduced-in.mjs';
import { missingLlmDescription } from './missing-llm-description.mjs';

/**
 * @type {Record<string, import('../types').LintRule>}
 */
export default {
  'duplicate-stability-nodes': duplicateStabilityNodes,
  'invalid-change-version': invalidChangeVersion,
  'missing-introduced-in': missingIntroducedIn,
  'missing-llm-description': missingLlmDescription,
};
