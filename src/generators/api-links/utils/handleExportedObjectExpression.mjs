'use strict';

import { CONSTRUCTOR_EXPRESSION } from '../constants.mjs';

/**
 * @param {import('../types').ProgramExports} exports
 * @param {import('acorn').NewExpression} rhs
 */
function handleNewExpression(exports, rhs) {
  // module.exports = new Asd()
  exports.ctors.push(rhs.callee.name);
}

/**
 * @param {import('../types').ProgramExports} exports
 * @param {import('acorn').ObjectExpression} rhs
 */
function handleObjectExpression(exports, rhs) {
  // module.exports = {}
  // We need to go through all of the properties and register them
  rhs.properties.forEach(({ value }) => {
    switch (value.type) {
      case 'Identifier': {
        exports.identifiers.push(value.name);

        if (CONSTRUCTOR_EXPRESSION.test(value.name[0])) {
          exports.ctors.push(value.name);
        }

        break;
      }
      case 'CallExpression': {
        if (value.callee.name !== 'deprecate') {
          break;
        }

        // Handle exports wrapped in the `deprecate` function
        //  Ex/ https://github.com/nodejs/node/blob/e96072ad57348ce423a8dd7639dcc3d1c34e847d/lib/buffer.js#L1334

        exports.identifiers.push(value.arguments[0].name);

        break;
      }
      default: {
        // Not relevant
      }
    }
  });
}

/**
 * @param {import('../types').ProgramExports} exports
 * @param {import('acorn').Identifier} rhs
 */
function handleIdentifier(exports, rhs) {
  // Something else, let's save it for when we're searching for
  //  declarations
  if (rhs.name !== undefined) {
    exports.identifiers.push(rhs.name);
  }
}

/**
 * @param {import('../types').ProgramExports} exports
 * @param {import('acorn').AssignmentExpression} param0
 */
export function handleExportedObjectExpression(exports, { right: rhs }) {
  // We need to move right until we find the value of the assignment.
  //  (if `a=b`, we want `b`)
  while (rhs.type === 'AssignmentExpression') {
    rhs = rhs.right;
  }

  switch (rhs.type) {
    /** @see https://github.com/estree/estree/blob/master/es5.md#newexpression */
    case 'NewExpression': {
      handleNewExpression(exports, rhs);
      break;
    }
    /** @see https://github.com/estree/estree/blob/master/es5.md#objectexpression */
    case 'ObjectExpression': {
      handleObjectExpression(exports, rhs);
      break;
    }
    /** @see https://github.com/estree/estree/blob/master/es5.md#identifier */
    case 'Identifier': {
      handleIdentifier(exports, rhs);
      break;
    }
    default: {
      // Not relevant
      break;
    }
  }
}
