import { visit } from 'unist-util-visit';
import createQueries from '../../utils/queries/index.mjs';
import {
  isSeq,
  parseDocument,
  isMap,
  isPair,
  isScalar,
  LineCounter,
} from 'yaml';
import {
  extractYamlContent,
  normalizeYamlSyntax,
} from '../../utils/parser/index.mjs';
import { LINT_MESSAGES } from '../constants.mjs';
import { valid } from 'semver';

/**
 * Checks if any change version is invalid
 *
 * @param {{value: string, location: import('../types').LintIssueLocation}[]} versions
 * @returns {Array<import('../types').LintIssue>}
 */
const getInvalidVersions = versions => {
  const issues = [];

  const invalidVersions = versions.filter(
    version => valid(version.value) === null
  );

  issues.push(
    ...invalidVersions.map(version => ({
      level: 'warn',
      message: LINT_MESSAGES.invalidChangeVersion.replace(
        '{{version}}',
        version.value
      ),
      location: version.location ?? undefined,
    }))
  );

  return issues;
};

/**
 * Normalizes a version
 *
 * @param {import('vfile').VFile} file
 * @param {Pair<unknown, unknown>} node
 * @param {LineCounter} lineCounter
 * @param {number} startLine
 */
const extractNodeVersions = (file, node, lineCounter, startLine) => {
  if (isSeq(node.value)) {
    return node.value.items.map(item => ({
      value: item.value,
      location: {
        path: `doc/api/${file.basename}`,
        position: {
          start: {
            line: lineCounter.linePos(item.range[0]).line + startLine,
          },
          end: {
            line: lineCounter.linePos(item.range[1]).line + startLine,
          },
        },
      },
    }));
  }

  if (isScalar(node.value)) {
    const offset = node.value.range[0];

    return [
      {
        value: node.value.value,
        location: {
          path: `doc/api/${file.basename}`,
          position: {
            start: {
              line: lineCounter.linePos(offset).line + startLine,
            },
            end: {
              line: lineCounter.linePos(node.value.range[1]).line + startLine,
            },
          },
        },
      },
    ];
  }

  throw new Error('Change item must be a seq or scalar');
};

/**
 * Checks if any change version is invalid
 *
 * @param {import('vfile').VFile} file
 * @param {import('mdast').Root} tree
 * @returns {Array<import('../types').LintIssue>}
 */
export const invalidChangeVersion = (file, tree) => {
  const issues = [];

  visit(tree, createQueries.UNIST.isYamlNode, node => {
    const lineCounter = new LineCounter();

    const normalizedYaml = normalizeYamlSyntax(extractYamlContent(node));
    const doc = parseDocument(normalizedYaml, {
      lineCounter,
    });

    const changes = doc.get('changes');

    if (!changes) {
      return;
    }

    if (!isSeq(changes)) {
      throw new Error('Changes must be an seq');
    }

    changes.items.forEach(changeNode => {
      if (isMap(changeNode) === false) {
        throw new Error('Change item must be a map');
      }

      changeNode.items.forEach(changeItem => {
        if (!isPair(changeItem)) {
          throw new Error('Change item must be a pair');
        }

        if (changeItem.key.value !== 'version') {
          return;
        }

        return issues.push(
          ...getInvalidVersions(
            extractNodeVersions(
              file,
              changeItem,
              lineCounter,
              node.position.start.line
            )
          )
        );
      });
    });
  });

  return issues;
};
