'use strict';

import { PARAM_EXPRESSION } from '../constants.mjs';

const OPTIONAL_LEVEL_CHANGES = { '[': 1, ']': -1, ' ': 0 };

/**
 * @param {string} parameterName
 * @param {number} optionalDepth
 * @returns {[string, number, boolean]}
 */
function parseNameAndOptionalStatus(parameterName, optionalDepth) {
  // Let's check if the parameter is optional & grab its name at the same time.
  //  We need to see if there's any leading brackets in front of the parameter
  //  name. While we're doing that, we can also get the index where the
  //  parameter's name actually starts at.
  let startingIdx = 0;
  for (; startingIdx < parameterName.length; startingIdx++) {
    const levelChange = OPTIONAL_LEVEL_CHANGES[parameterName[startingIdx]];

    if (!levelChange) {
      break;
    }

    optionalDepth += levelChange;
  }

  const isParameterOptional = optionalDepth > 0;

  // Now let's check for any trailing brackets at the end of the parameter's
  //  name. This will tell us where the parameter's name ends.
  let endingIdx = parameterName.length - 1;
  for (; endingIdx >= 0; endingIdx--) {
    const levelChange = OPTIONAL_LEVEL_CHANGES[parameterName[startingIdx]];

    if (!levelChange) {
      break;
    }

    optionalDepth += levelChange;
  }
  console.log('', startingIdx, endingIdx)
  return [
    parameterName.substring(startingIdx, endingIdx + 1),
    optionalDepth,
    isParameterOptional
  ];
}

/**
 * @param {string} parameterName
 * @returns {[string, string | undefined]} 
 */
function parseDefaultValue(parameterName) {
  /**
   * @type {string | undefined}
   */
  let defaultValue

  const equalSignPos = parameterName.indexOf('=');
  if (equalSignPos !== -1) {
    // We do have a default value, let's extract it
    defaultValue = parameterName.substring(equalSignPos).trim();

    // Let's remove the default value from the parameter name
    parameterName = parameterName.substring(0, equalSignPos);
  }

  return [parameterName, defaultValue]
}

/**
 * @param {string} parameterName 
 * @param {number} index 
 * @param {Array<import('../types.d.ts').List>} markdownParameters 
 * @returns {import('../types.d.ts').Parameter}
 */
function findParameter(parameterName, index, markdownParameters) {
  let parameter = markdownParameters[index]
  if (parameter && parameter.name === parameterName) {
    return parameter
  }

  // Method likely has multiple signatures, something like
  //  `new Console(stdout[, stderr][, ignoreErrors])` and `new Console(options)`  
  // Try to find the parameter that this is being shared with
  for (const markdownProperty of markdownParameters) {
    if (markdownProperty.name === parameterName) {
      // Found it
      return markdownParameters
    } else if (markdownProperty.options) {
      for (const option of markdownProperty.options) {
        if (option.name === parameterName) {
          // Found a matching one in the parameter's options
          return Object.assign({}, option);
        }
      }
    }
  }

  // At this point, we couldn't find a shared signature
  if (parameterName.startsWith('...')) {
    return { name: parameterName };
  } else {
    throw new Error(
      `Invalid param "${parameterName}"`
    );
  }
}

/**
 * @param {string[]} declaredParameters
 * @param {Array<import('../types.d.ts').List>} parameters
 */
function parseParameters(declaredParameters, markdownParameters) {
  /**
   * @type {Array<import('../types.d.ts').Parameter>}
   */
  let parameters = [];

  let optionalDepth = 0;

  declaredParameters.forEach((parameterName, i) => {
    /**
     * @example 'length]]'
     * @example 'arrayBuffer['
     * @example '[sources['
     * @example 'end'
     */
    parameterName = parameterName.trim();

    // We need to do three things here:
    //  1. Determine the declared parameters' name
    //  2. Determine if the parameter is optional
    //  3. Determine if the parameter has a default value

    /**
     * This will handle the first and second thing for us
     * @type {boolean}
     */
    console.log(parameterName)
    let isParameterOptional;
    [parameterName, optionalDepth, isParameterOptional] =
      parseNameAndOptionalStatus(parameterName, optionalDepth);

      console.log('', parameterName)
    /**
     * Now let's work on the third thing
     * @type {string | undefined}
     */
    let defaultValue;
    [parameterName, defaultValue] = parseDefaultValue(parameterName)

    const parameter = findParameter(parameterName, i, markdownParameters)

    if (isParameterOptional) {
      parameter.optional = true
    }

    if (defaultValue) {
      parameter.default = defaultValue
    }

    parameters.push(parameter)
  });

  return parameters;
}

/**
 * @param {string} textRaw Something like `new buffer.Blob([sources[, options]])`
 * @param {Array<import('../types.d.ts').List} markdownParameters The properties in the AST
 * @returns {import('../types.d.ts').MethodSignature | undefined}
 */
export default (textRaw, markdownParameters) => {
  /**
   * @type {import('../types.d.ts').MethodSignature}
   */
  const signature = {};

  // Find the return value & filter it out
  markdownParameters = markdownParameters.filter(value => {
    if (value.name === 'return') {
      signature.return = value;
      return false;
    }

    return true;
  });

  /**
   * Extract the parameters from the method's declaration
   * @example `[sources[, options]]`
   */
  let [, declaredParameters] = `\`${textRaw}\``.match(PARAM_EXPRESSION) || [];

  if (!declaredParameters) {
    return undefined;
  }

  /**
   * @type {string[]}
   * @example ['sources[,', 'options]]']
   */
  declaredParameters = declaredParameters.split(',');

  signature.params = parseParameters(declaredParameters, markdownParameters);

  return signature;
}
