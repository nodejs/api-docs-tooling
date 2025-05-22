import { valid, parse } from 'semver';
import { env } from 'node:process';
import { visit } from 'unist-util-visit';
import yaml from 'yaml';

import createQueries from '../../utils/queries/index.mjs';
import {
  extractYamlContent,
  normalizeYamlSyntax,
} from '../../utils/parser/index.mjs';
import { LINT_MESSAGES } from '../constants.mjs';
import { enforceArray } from '../../utils/array.mjs';

const NODE_RELEASED_VERSIONS = env.NODE_RELEASED_VERSIONS?.split(',');

/**
 * Checks if the given version is "REPLACEME" and the array length is 1.
 *
 * @param {string} version - The version to check.
 * @param {number} length - Length of the version array.
 * @returns {boolean} True if conditions match, otherwise false.
 */
const isValidReplaceMe = (version, length) =>
  length === 1 && version === 'REPLACEME';

/**
 * Checks if a given semantic version should be ignored.
 * A version is considered ignored if its major version is 0 and minor version is less than 2.
 *
 * These versions are extremely old, and are not shown in the changelog used to generate
 * `NODE_RELEASED_VERSIONS`, so they must be hardcoded.
 *
 * @param {string} version - The version to check.
 * @returns {boolean} Returns true if the version is ignored, false otherwise.
 */
const isIgnoredVersion = version => {
  const { major, minor } = parse(version) || {};
  return major === 0 && minor < 2;
};

/**
 * Determines if a given version is invalid.
 *
 * @param {string} version - The version to check.
 * @param {unknown} _ - Unused parameter.
 * @param {{ length: number }} context - Array containing the length property.
 * @returns {boolean} True if the version is invalid, otherwise false.
 */
const isInvalid = NODE_RELEASED_VERSIONS
  ? (version, _, { length }) =>
      !(
        isValidReplaceMe(version, length) ||
        isIgnoredVersion(version) ||
        NODE_RELEASED_VERSIONS.includes(version.replace(/^v/, ''))
      )
  : (version, _, { length }) =>
      !(isValidReplaceMe(version, length) || valid(version));

/**
 * Identifies invalid change versions from metadata entries.
 *
 * @param {import('../types.d.ts').LintContext} context
 * @returns {void}
 */
export const invalidChangeVersion = context => {
  visit(context.tree, createQueries.UNIST.isYamlNode, node => {
    const yamlContent = extractYamlContent(node);

    const normalizedYaml = normalizeYamlSyntax(yamlContent);

    // TODO: Use YAML AST to provide better issues positions
    /**
     * @type {ApiDocRawMetadataEntry}
     */
    const { changes } = yaml.parse(normalizedYaml);

    if (!changes) {
      return;
    }

    changes.forEach(({ version }) =>
      enforceArray(version)
        .filter(isInvalid)
        .forEach(version =>
          context.report({
            level: 'error',
            message: version
              ? LINT_MESSAGES.invalidChangeVersion.replace(
                  '{{version}}',
                  version
                )
              : LINT_MESSAGES.missingChangeVersion,
            position: node.position,
          })
        )
    );
  });
};
