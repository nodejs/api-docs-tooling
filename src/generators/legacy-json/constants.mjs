/**
 * Denotes a method's return value
 */
export const RETURN_EXPRESSION = /^returns?\s*:?\s*/i;

/**
 * Denotes a method's name
 */
export const NAME_EXPRESSION = /^['`"]?([^'`": {]+)['`"]?\s*:?\s*/;

/**
 * Denotes a method's type
 */
export const TYPE_EXPRESSION = /^\{([^}]+)\}\s*/;

/**
 * Is there a leading hyphen
 */
export const LEADING_HYPHEN = /^-\s*/;

/**
 * Denotes a default value
 */
export const DEFAULT_EXPRESSION = /\s*\*\*Default:\*\*\s*([^]+)$/i;

/**
 * Grabs the parameters from a method's signature
 * @example 'new buffer.Blob([sources[, options]])'.match(PARAM_EXPRESSION) = ['([sources[, options]])', '[sources[, options]]']
 */
export const PARAM_EXPRESSION = /\((.+)\);?$/;
