// ============================================================================
// CAMEL CASE AND IDENTIFIER PATTERNS
// ============================================================================

/**
 * Matches camel case identifiers, optionally with dot notation.
 * Examples:
 * - 'someVar'
 * - 'SomeClass'
 * - 'module.exports'
 * - 'path.to.nestedProperty'
 */
const CAMEL_CASE = '\\w+(?:\\.\\w+)*';

/**
 * Matches object properties in dot notation or bracket notation.
 * Examples:
 * - 'object.property'
 * - 'object[property]'
 * - 'nested.object.property'
 * - 'object[nested.property]'
 */
const PROPERTY = `${CAMEL_CASE}(?:(\\[${CAMEL_CASE}\\])|\\.(\\w+))`;

/**
 * Matches function call parentheses including their parameters.
 * Examples:
 * - '()'
 * - '(arg)'
 * - '(arg1, arg2)'
 * - '(options = {})'
 */
const FUNCTION_CALL = '\\([^)]*\\)';

// ============================================================================
// DOCUMENTATION HEADING PATTERNS
// ============================================================================

/**
 * Matches class headings in documentation.
 * Examples:
 * - 'Class: Buffer'
 * - 'Class: Socket'
 * - 'Class: EventEmitter extends NodeEventTarget'
 * - 'Class: `Stream`'
 * - 'Class: `ChildProcess extends EventEmitter`'
 */
export const CLASS_HEADING = new RegExp(
  `Class: +\`?(${CAMEL_CASE}(?: extends +${CAMEL_CASE})?)\`?$`,
  'i'
);

/**
 * Matches constructor headings in documentation.
 * Can be in the format 'new ClassName()' or 'Constructor: new ClassName()'.
 * Examples:
 * - 'new Buffer()'
 * - 'new URL(input[, base])'
 * - 'Constructor: new Stream()'
 * - 'Constructor: new `EventEmitter()`'
 */
export const CTOR_HEADING = new RegExp(
  `^(?:Constructor: +)?\`?new +(${CAMEL_CASE})${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches static method headings in documentation.
 * Examples:
 * - 'Static method: Buffer.isBuffer()'
 * - 'Static method: Class.staticMethod(arg1, arg2)'
 * - 'Static method: Module.method()'
 * - 'Static method: `Object[util.inspect.custom]()`'
 */
export const CLASS_METHOD_HEADING = new RegExp(
  `^Static method: +\`?${PROPERTY}${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches API method headings in documentation.
 * Examples:
 * - '`something()`
 * - '`fs.readFile()`'
 * - '`http.request()`'
 * - '`array.forEach()`'
 * - '`emitter.on(eventName, listener)`'
 */
export const METHOD_HEADING = new RegExp(
  `^\`(?:${PROPERTY}|(${CAMEL_CASE}))${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches class property headings in documentation.
 * Can be in the format 'Class.property', 'Class[property]', or 'Class property: Class.property'.
 * Examples:
 * - 'Class.property'
 * - 'Class property: Buffer.poolSize'
 * - 'process.env'
 * - 'fs[Symbol.asyncIterator]'
 */
export const PROPERTY_HEADING = new RegExp(
  `^(?:Class property: +)?\`?${PROPERTY}\`?$`,
  'i'
);

/**
 * Matches event headings in documentation.
 * Examples:
 * - 'Event: \'close\''
 * - 'Event: "data"'
 * - 'Event: `error`'
 * - 'Event: \'connection\''
 */
export const EVENT_HEADING = /^Event: +`?['"]?([^'"]+)['"]?`?$/i;

// ============================================================================
// TYPE AND REFERENCE PATTERNS
// ============================================================================

/**
 * Matches API type references enclosed in curly braces or angle brackets.
 * Used to normalize type references across documentation.
 * Examples:
 * - '{string}'
 * - '{Buffer|string}'
 * - '<Object>'
 */
export const NORMALIZE_TYPES = /(\{|<)(?! )[^<({})>]+(?! )(\}|>)/g;

/**
 * Matches already-parsed API type references in Markdown link format.
 * Used to detect and handle linked type references.
 * Examples:
 * - '[`<string>`](/api/string)'
 * - '[`<Buffer>`](/api/buffer)'
 */
export const LINKS_WITH_TYPES = /\[`<[^<({})>]+>`\]\((\S+)\)/g;

/**
 * Matches headings that start typed lists in documentation.
 * These are used to introduce return values, type descriptions, and inheritance information.
 * Examples:
 * - 'Returns: {string}'
 * - 'Extends: {EventEmitter}'
 * - 'Type: {Object}'
 * - 'Returns:'
 */
export const TYPED_LIST_STARTERS = /^(Returns|Extends|Type):?\s*/;

/**
 * Matches type expressions in curly braces.
 * Examples:
 * - '{string}'
 * - '{Buffer|null}'
 * - '{Object}'
 */
export const TYPE_EXPRESSION = /^\{([^}]+)\}\s*/;

// ============================================================================
// PARAMETER AND EXPRESSION PATTERNS
// ============================================================================

/**
 * Matches name expressions with optional quotes and colons.
 * Examples:
 * - 'propertyName:'
 * - '"quoted-name":'
 * - '`backtick-name`'
 */
export const NAME_EXPRESSION = /^['`"]?([^'`": {]+)['`"]?\s*:?\s*/;

/**
 * Matches parameter expressions in parentheses.
 * Examples:
 * - '(required)'
 * - '(optional);'
 * - '(callback)'
 */
export const PARAM_EXPRESSION = /\((.+)\);?$/;

/**
 * Matches default value expressions.
 * Examples:
 * - '**Default:** `true`'
 * - '**Default:** 0'
 */
export const DEFAULT_EXPRESSION = /\s*\*\*Default:\*\*\s*([^]+)$/i;

/**
 * Matches leading hyphens in list items.
 * Examples:
 * - '- item'
 * - '-  spaced item'
 */
export const LEADING_HYPHEN = /^-\s*/;

// ============================================================================
// URL AND REFERENCE PATTERNS
// ============================================================================

/**
 * Matches references to Markdown pages in the API documentation.
 * Captures the file path and optional anchor.
 * Examples:
 * - 'fs.md'
 * - 'buffer.md#buffer_class_buffer'
 * - 'stream.md#stream_readable_streams'
 * - 'errors.md#errors_class_error'
 */
export const MARKDOWN_URL = /^(?![+a-zA-Z]+:)([^#?]+)\.md(#.+)?$/;

/**
 * Matches Unix manual references like those in command-line documentation.
 * Format: command(section[subsection])
 * Examples:
 * - 'ls(1)'
 * - 'printf(3)'
 * - 'socket(7)'
 * - 'malloc(3c)'
 * - 'signal.h(0p)'
 */
export const UNIX_MANUAL_PAGE = /\b([a-z.]+)\((\d)([a-z]?)\)/g;

// ============================================================================
// METADATA AND COMMENT PATTERNS
// ============================================================================

/**
 * Matches just the Stability Index prefix value from documentation.
 * The stability index indicates how stable an API is, from 0 (deprecated) to 5 (locked).
 * Examples:
 * - 'Stability: 0'
 * - 'Stability: 1'
 * - 'Stability: 2'
 * - 'Stability: 3.1'
 */
export const STABILITY_INDEX_PREFIX = /Stability: ([0-5](?:\.[0-3])?)/;

/**
 * Matches complete Stability Index metadata lines including descriptions.
 * These lines indicate the stability level of APIs in the documentation.
 * Examples:
 * - 'Stability: 0 - Deprecated'
 * - 'Stability: 1 - Experimental'
 * - 'Stability: 2 - Stable'
 * - 'Stability: 3.1 - Legacy'
 */
export const STABILITY_INDEX = new RegExp(
  `^${STABILITY_INDEX_PREFIX.source}(?:\\s*-\\s*)?(.*)$`,
  's'
);

/**
 * Extracts inner content from HTML comment-enclosed YAML blocks in documentation.
 * These blocks contain metadata about the documentation page.
 * Examples:
 * - '<!-- YAML foo bar -->'
 * - '<!-- description -->'
 */
export const YAML_INNER_CONTENT =
  /^<!--[ ]?(?:YAML([\s\S]*?)|([ \S]*?))?[ ]?-->/;

/**
 * Matches code filename comments at the beginning of files.
 * Examples:
 * - '// example.js'
 * - '// lib/module.cc'
 * - '// src/header.h'
 */
export const EXTRACT_CODE_FILENAME_COMMENT = /^\/\/\s+(.*\.(?:cc|h|js))[\r\n]/;

/**
 * Matches HTML comments with introduced_in metadata.
 * Examples:
 * - '<!-- introduced_in=v10.0.0 -->'
 */
export const INTRODUCED_IN = /<!--\s?introduced_in=.*-->/;

/**
 * Matches HTML comments with LLM description metadata.
 * Examples:
 * - '<!-- llm_description=... -->'
 */
export const LLM_DESCRIPTION = /<!--\s?llm_description=.*-->/;

// ============================================================================
// NODE.JS VERSION AND LIST PATTERNS
// ============================================================================

/**
 * Matches Node.js version entries in changelog or version lists.
 * Examples:
 * - '* [Node.js 18.0.0] Some description'
 * - '* [Node.js 16.14.2] Bug fixes'
 */
export const NODE_VERSIONS = /\* \[Node\.js ([0-9.]+)\]\S+ (.*)\r?\n/g;

/**
 * Matches list items with Markdown links.
 * Examples:
 * - '* [Buffer](buffer.md)'
 * - '* [File System](fs.md)'
 */
export const LIST_ITEM = /\* \[(.*?)\]\((.*?)\.md\)/g;

/**
 * Matches Long Term Support indicators in version descriptions.
 * Examples:
 * - 'Long Term Support'
 * - 'long term support'
 */
export const NODE_LTS_VERSION = /Long Term Support/i;
