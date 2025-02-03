'use strict';

/**
 * @param {import('../types.d.ts').ProgramExports} exports
 * @param {import('acorn').AssignmentExpression} param1
 * @param {string} basename
 * @param {Record<string, number>} nameToLineNumberMap
 */
export function handleExportedPropertyExpression(
  exports,
  { left: lhs, right: rhs, loc },
  basename,
  nameToLineNumberMap
) {
  switch (rhs.type) {
    /** @see https://github.com/estree/estree/blob/master/es5.md#functionexpression */
    case 'FunctionExpression': {
      // module.exports.something = () => {}
      nameToLineNumberMap[`${basename}.${lhs.property.name}`] = loc.start.line;

      break;
    }
    /** @see https://github.com/estree/estree/blob/master/es5.md#identifier */
    case 'Identifier': {
      // Save this for later in case it's referenced
      // module.exports.asd = something
      if (rhs.name === lhs.property.name) {
        exports.indirects[lhs.property.name] =
          `${basename}.${lhs.property.name}`;
      }

      break;
    }
    default: {
      if (lhs.property.name !== undefined) {
        // Something else, let's save it for when we're searching for
        //  declarations
        exports.identifiers.push(lhs.property.name);
      }

      break;
    }
  }
}
