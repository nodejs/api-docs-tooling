// @ts-check
'use strict';

/**
 * @param {import('acorn').AssignmentExpression} expression
 * @param {import('acorn').SourceLocation} loc
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @returns {import('../types').ProgramExports | undefined}
 */
function extractExpression(expression, loc, basename, nameToLineNumberMap) {
  /**
   * @example `a=b`, lhs=`a` and rhs=`b`
   */
  let { left: lhs, right: rhs } = expression;

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
  };

  if (lhs.object.name === 'exports') {
    // Assigning a property in `module.exports` (i.e. `module.exports.asd = ...`)
    const { name } = lhs.property;

    switch (rhs.type) {
      case 'FunctionExpression':
        // module.exports.something = () => {}
        nameToLineNumberMap[`${basename}.${name}`] = loc.start.line;
        break;

      case 'Identifier':
        // module.exports.asd = something
        // TODO indirects?
        console.log('indir', name);
        break;

      default:
        exports.identifiers.push(name);
        break;
    }
  } else if (lhs.object.name === 'module' && lhs.property.name === 'exports') {
    // Assigning `module.exports` as a whole, (i.e. `module.exports = {}`)
    while (rhs.type === 'AssignmentExpression') {
      // Move right until we find the value of the assignment
      //  (i.e. `a=b`, we want `b`).
      rhs = rhs.right;
    }

    switch (rhs.type) {
      case 'NewExpression':
        // module.exports = new Asd()
        exports.ctors.push(rhs.callee.name);
        break;

      case 'ObjectExpression':
        // module.exports = {}
        // We need to go through all of the properties and add register them
        rhs.properties.forEach(({ value }) => {
          if (value.type !== 'Identifier') {
            return;
          }

          exports.identifiers.push(value.name);

          if (/^[A-Z]/.test(value.name[0])) {
            exports.ctors.push(value.name);
          }
        });

        break;

      default:
        exports.identifiers.push(rhs.name);
        break;
    }
  }

  return exports;
}

/**
 * @param {import('acorn').VariableDeclarator} declaration
 * @param {import('acorn').SourceLocation} loc
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @returns {import('../types').ProgramExports | undefined}
 */
function extractVariableDeclaration(
  { id, init },
  loc,
  basename,
  nameToLineNumberMap
) {
  while (init && init.type === 'AssignmentExpression') {
    // Move left until we get to what we're assigning to
    //  (i.e. `a=b`, we want `a`)
    init = init.left;
  }

  if (!init || init.type !== 'MemberExpression') {
    // Doesn't exist or we're not writing to a member (probably a normal var,
    //  like `const a = 123`)
    return undefined;
  }

  /**
   * @type {import('../types').ProgramExports}
   */
  const exports = {
    ctors: [],
    identifiers: [],
  };

  if (init.object.name === 'exports') {
    // Assigning a property in `module.exports` (i.e. `module.exports.asd = ...`)
    nameToLineNumberMap[`${basename}.${init.property.name}`] = loc.start.line;
  } else if (
    init.object.name === 'module' &&
    init.property.name === 'exports'
  ) {
    // Assigning `module.exports` as a whole, (i.e. `module.exports = {}`)
    exports.ctors.push(id.name);
    nameToLineNumberMap[id.name] = loc.start.line;
  }

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
  };

  program.body.forEach(statement => {
    const { loc } = statement;
    if (!loc) {
      return;
    }

    switch (statement.type) {
      case 'ExpressionStatement': {
        const { expression } = statement;
        if (expression.type !== 'AssignmentExpression' || !loc) {
          break;
        }

        const expressionExports = extractExpression(
          expression,
          loc,
          basename,
          nameToLineNumberMap
        );

        if (expressionExports) {
          exports.ctors.push(...expressionExports.ctors);
          exports.identifiers.push(...expressionExports.identifiers);
        }

        break;
      }

      case 'VariableDeclaration': {
        statement.declarations.forEach(declaration => {
          const variableExports = extractVariableDeclaration(
            declaration,
            loc,
            basename,
            nameToLineNumberMap
          );

          if (variableExports) {
            exports.ctors.push(...variableExports.ctors);
            exports.identifiers.push(...variableExports.identifiers);
          }
        });

        break;
      }

      default:
        break;
    }
  });

  return exports;
}
