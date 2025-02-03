'use strict';

import { visit } from 'estree-util-visit';
import { handleExportedPropertyExpression } from './handleExportedPropertyExpression.mjs';
import { handleExportedObjectExpression } from './handleExportedObjectExpression.mjs';

/**
 * @see https://github.com/estree/estree/blob/master/es5.md#assignmentexpression
 *
 * @param {import('acorn').ExpressionStatement} node
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @returns {import('../types').ProgramExports | undefined}
 */
function handleExpression(node, basename, nameToLineNumberMap) {
  const { expression } = node;

  if (expression.type !== 'AssignmentExpression') {
    return;
  }

  let { left: lhs } = expression;

  if (lhs.type !== 'MemberExpression') {
    return undefined;
  }

  if (lhs.object.type === 'MemberExpression') {
    lhs = lhs.object;
  }

  /**
   * @type {import('../types').ProgramExports}
   */
  const exports = {
    ctors: [],
    identifiers: [],
    indirects: {},
  };

  if (lhs.object.name === 'exports') {
    // This is an assignment to a property in `module.exports` or `exports`
    //  (i.e. `module.exports.asd = ...`)
    handleExportedPropertyExpression(
      exports,
      expression,
      basename,
      nameToLineNumberMap
    );
  } else if (lhs.object.name === 'module' && lhs.property.name === 'exports') {
    // This is an assignment to `module.exports` as a whole
    //  (i.e. `module.exports = {}`)
    handleExportedObjectExpression(exports, expression);
  }

  return exports;
}

/**
 * @see https://github.com/estree/estree/blob/master/es5.md#variabledeclaration
 *
 * @param {import('acorn').VariableDeclaration} node
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @returns {import('../types').ProgramExports | undefined}
 */
function handleVariableDeclaration(node, basename, nameToLineNumberMap) {
  /**
   * @type {import('../types').ProgramExports}
   */
  const exports = {
    ctors: [],
    identifiers: [],
    indirects: {},
  };

  node.declarations.forEach(({ init: lhs, id }) => {
    while (lhs && lhs.type === 'AssignmentExpression') {
      // Move left until we get to what we're assigning to
      //  (if `a=b`, we want `a`)
      lhs = lhs.left;
    }

    if (!lhs || lhs.type !== 'MemberExpression') {
      // Doesn't exist or we're not writing to an object
      //  (aka it's just a regular variable like `const a = 123`)
      return;
    }

    switch (lhs.object.name) {
      case 'exports': {
        nameToLineNumberMap[`${basename}.${lhs.property.name}`] =
          node.start.line;

        break;
      }
      case 'module': {
        if (lhs.property.name !== 'exports') {
          break;
        }

        exports.ctors.push(id.name);
        nameToLineNumberMap[id.name] = node.loc.start.line;

        break;
      }
      default: {
        // Not relevant to us
        break;
      }
    }
  });

  return exports;
}

/**
 * We need to find what a source file exports so we know what to include in
 * the final result. We can do this by going through every statement in the
 * program looking for assignments to `module.exports`.
 *
 * Noteworthy that exports can happen throughout the program so we need to
 * go through the entire thing.
 *
 * @param {import('acorn').Program} program
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @returns {import('../types').ProgramExports}
 */
export function extractExports(program, basename, nameToLineNumberMap) {
  /**
   * @type {import('../types').ProgramExports}
   */
  const exports = {
    ctors: [],
    identifiers: [],
    indirects: {},
  };

  const TYPE_TO_HANDLER_MAP = {
    /**
     * @param {import('acorn').Node} node
     */
    ExpressionStatement: node =>
      handleExpression(node, basename, nameToLineNumberMap),

    /**
     * @param {import('acorn').Node} node
     */
    VariableDeclaration: node =>
      handleVariableDeclaration(node, basename, nameToLineNumberMap),
  };

  visit(program, node => {
    if (!node.loc) {
      return;
    }

    if (node.type in TYPE_TO_HANDLER_MAP) {
      const handler = TYPE_TO_HANDLER_MAP[node.type];

      const output = handler(node);

      if (output) {
        exports.ctors.push(...output.ctors);
        exports.identifiers.push(...output.identifiers);

        Object.keys(output.indirects).forEach(key => {
          exports.indirects[key] = output.indirects[key];
        });
      }
    }
  });

  return exports;
}
