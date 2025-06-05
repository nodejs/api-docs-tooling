'use strict';

import { duplicateStabilityNodes } from './duplicate-stability-nodes.mjs';
import { invalidChangeVersion } from './invalid-change-version.mjs';
import { missingMetadata } from './missing-metadata.mjs';

/**
 * @type {Record<string, import('../types').LintRule>}
 */
export default {
  'duplicate-stability-nodes': duplicateStabilityNodes,
  'invalid-change-version': invalidChangeVersion,
  'missing-metadata': missingMetadata,
};
