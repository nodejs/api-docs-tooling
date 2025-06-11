import { env } from 'node:process';

import { valid, parse } from 'semver';
import { visit } from 'unist-util-visit';
import { isMap, isSeq, LineCounter, parseDocument } from 'yaml';

import {
  extractYamlContent,
  normalizeYamlSyntax,
} from '../../utils/parser/index.mjs';
import createQueries from '../../utils/queries/index.mjs';
import { LINT_MESSAGES } from '../constants.mjs';
import {
  createYamlIssueReporter,
  findPropertyByName,
  normalizeNode,
} from '../utils/yaml.mjs';

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
 * @param {Scalar} version - The version to check.
 * @param {unknown} _ - Unused parameter.
 * @param {{ length: number }} context - Array containing the length property.
 * @returns {boolean} True if the version is invalid, otherwise false.
 */
const isInvalid = NODE_RELEASED_VERSIONS
  ? (version, _, { length }) =>
      !(
        isValidReplaceMe(version.value, length) ||
        isIgnoredVersion(version.value) ||
        NODE_RELEASED_VERSIONS.includes(version.value.replace(/^v/, ''))
      )
  : (version, _, { length }) =>
      !(isValidReplaceMe(version.value, length) || valid(version.value));

/**
 * Validates and extracts versions of a change node
 *
 * @param {object} root0
 * @param {import('../types.d.ts').LintContext} root0.context
 * @param {import('yaml').Node} root0.node
 * @param {(message: string, node: import('yaml').Node<unknown>) => import('../types.d.ts').IssueDescriptor} root0.report
 */
export const extractVersions = ({ context, node, report }) => {
  if (!isMap(node)) {
    context.report(
      report(
        LINT_MESSAGES.invalidChangeProperty.replace('{{type}}', node.type),
        node
      )
    );

    return [];
  }

  const versionNode = findPropertyByName(node, 'version');

  if (!versionNode) {
    context.report(report(LINT_MESSAGES.missingChangeVersion, node));

    return [];
  }

  return normalizeNode(versionNode.value);
};

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

    const lineCounter = new LineCounter();
    const document = parseDocument(normalizedYaml, { lineCounter });

    const report = createYamlIssueReporter(node, lineCounter);

    // Skip if yaml isn't a mapping
    if (!isMap(document.contents)) {
      return;
    }

    const changesNode = findPropertyByName(document.contents, 'changes');

    // Skip if changes node is not present
    if (!changesNode) {
      return;
    }

    // Validate changes node is a sequence
    if (!isSeq(changesNode.value)) {
      return context.report(
        report(
          LINT_MESSAGES.invalidChangeProperty.replace(
            '{{type}}',
            changesNode.value.type
          ),
          changesNode.key
        )
      );
    }

    changesNode.value.items.forEach(node => {
      extractVersions({ context, node, report })
        .filter(Boolean) // Filter already reported empt items,
        .filter(isInvalid)
        .forEach(version =>
          context.report(
            report(
              version?.value
                ? LINT_MESSAGES.invalidChangeVersion.replace(
                    '{{version}}',
                    version.value
                  )
                : LINT_MESSAGES.missingChangeVersion,
              version
            )
          )
        );
    });
  });
};
