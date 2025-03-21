'use strict';

import { duplicateStabilityNodes } from './duplicate-stability-nodes.mjs';
import { invalidChangeVersion } from './invalid-change-version.mjs';
import { missingChangeVersion } from './missing-change-version.mjs';
import { missingIntroducedIn } from './missing-introduced-in.mjs';

/**
 * @type {Record<string, import('../types').SingleEntryLintRule>}
 */
export const singleEntryRules = {
  'invalid-change-version': invalidChangeVersion,
  'missing-change-version': missingChangeVersion,
  'missing-introduced-in': missingIntroducedIn,
};

/**
 * @type {Record<string, import('../types').MultipleEntriesLintRule>}
 */
export const multiEntryRules = {
  'duplicate-stability-nodes': duplicateStabilityNodes,
};
