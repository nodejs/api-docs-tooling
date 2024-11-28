// @ts-check
'use strict';

/**
 * @param {import('acorn').AssignmentExpression} expression
 * @param {import('acorn').SourceLocation} loc
 * @param {Record<string, number>} nameToLineNumberMap
 * @param {import('../types').ProgramExports} exports
 */
function handleAssignmentExpression(
  expression,
  loc,
  nameToLineNumberMap,
  exports
) {
  const { left: lhs } = expression;
  if (lhs.type !== 'MemberExpression') {
    // We're not assigning to a member, don't care
    return;
  }

  let object;
  let objectName;
  switch (lhs.object.type) {
    case 'MemberExpression': {
      if (lhs.object.property.name !== 'prototype') {
        return;
      }

      // Something like `ClassName.prototype.asd = 123`
      object = lhs.object.object;

      objectName = object.name.toLowerCase();

      // Special case for buffer because ???
      if (objectName === 'buffer') {
        objectName = 'buf';
      }

      break;
    }

    case 'Identifier': {
      object = lhs.object;
      objectName = object.name;
      break;
    }

    default:
      return;
  }

  if (!exports.ctors.includes(object.name)) {
    // The object this property is being assigned to isn't exported
    return;
  }

  let name = `${objectName}${lhs.computed ? `[${lhs.property.name}]` : `.${lhs.property.name}`}`;
  nameToLineNumberMap[name] = loc.start.line;
}

/**
 * @param {import('acorn').FunctionDeclaration} declaration
 * @param {import('acorn').SourceLocation} loc
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @param {import('../types').ProgramExports} exports
 */
function handleFunctionDeclaration(
  { id },
  loc,
  basename,
  nameToLineNumberMap,
  exports
) {
  if (!exports.identifiers.includes(id.name)) {
    // Function isn't exported, we don't care about it
    return;
  }

  if (basename.startsWith('_')) {
    // Internal function, we don't want to include it in docs
    return;
  }

  nameToLineNumberMap[`${basename}.${id.name}`] = loc.start.line;
}

/**
 * @param {import('acorn').ClassDeclaration} declaration
 * @param {Record<string, number>} nameToLineNumberMap
 * @param {import('../types').ProgramExports} exports
 */
function handleClassDeclaration({ id, body }, nameToLineNumberMap, exports) {
  if (!exports.ctors.includes(id.name)) {
    // Class isn't exported
    return;
  }

  const name = id.name.slice(0, 1).toLowerCase() + id.name.slice(1);

  // Iterate through the class's properties so we can include all of its
  //  public methods
  body.body.forEach(({ key, type, kind, loc }) => {
    if (!loc || type !== 'MethodDefinition') {
      return;
    }

    if (kind === 'constructor') {
      nameToLineNumberMap[`new ${id.name}`] = loc.start.line;
    } else if (kind === 'method') {
      nameToLineNumberMap[`${name}.${key.name}`] = loc.start.line;
    }
  });
}

/**
 * @param {import('acorn').Program} program
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 * @param {import('../types').ProgramExports} exports
 */
export function findDefinitions(
  program,
  basename,
  nameToLineNumberMap,
  exports
) {
  program.body.forEach(statement => {
    const { loc } = statement;
    if (!loc) {
      return;
    }

    switch (statement.type) {
      case 'ExpressionStatement': {
        const { expression } = statement;

        if (expression.type !== 'AssignmentExpression') {
          return;
        }

        handleAssignmentExpression(
          expression,
          loc,
          nameToLineNumberMap,
          exports
        );

        break;
      }

      case 'FunctionDeclaration': {
        handleFunctionDeclaration(
          statement,
          loc,
          basename,
          nameToLineNumberMap,
          exports
        );
        break;
      }

      case 'ClassDeclaration': {
        handleClassDeclaration(statement, nameToLineNumberMap, exports);
        break;
      }

      default:
        break;
    }
  });
}
