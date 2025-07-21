const CAMEL_CASE = '\\w+(?:\\.\\w+)*';
const FUNCTION_CALL = '\\([^)]*\\)';
const PROPERTY = `${CAMEL_CASE}(?:(\\[\\w+\\.\\w+\\])|\\.(\\w+))`;

/**
 * Matches class headings like `Class: SomeClass` or `Class: SomeClass extends BaseClass`
 */
export const CLASS_HEADING = new RegExp(
  `Class: +\`?(${CAMEL_CASE}(?: extends +${CAMEL_CASE})?)\`?$`,
  'i'
);

/**
 * Matches static method headings like `Static method: SomeClass.method()` or `SomeClass[foo.bar]()`
 */
export const CLASS_METHOD_HEADING = new RegExp(
  `^Static method: +\`?${PROPERTY}${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches constructor headings like `new SomeClass()` or `Constructor: new SomeClass()`
 */
export const CTOR_HEADING = new RegExp(
  `^(?:Constructor: +)?\`?new +(${CAMEL_CASE})${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches class property headings like `Class property: SomeClass.prop` or `SomeClass[foo.bar]`
 */
export const PROPERTY_HEADING = new RegExp(
  `^(?:Class property: +)?\`?${PROPERTY}\`?$`,
  'i'
);

/**
 * Matches API method headings like `foo[bar]()`, `foo.bar()`, or `foobar()`
 */
export const METHOD_HEADING = new RegExp(
  `^\`${PROPERTY}${FUNCTION_CALL}\`?$`,
  'i'
);

/**
 * Matches event headings like `Event: 'some-event'` or `Event: "some-event"`
 */
export const EVENT_HEADING = /^Event: +`?['"]?([^'"]+)['"]?`?$/i;
/**
 * Matches API type references like `{Type}` or `<Type>`
 */
export const NORMALIZE_TYPES = /(\{|<)(?! )[a-zA-Z0-9.| [\]\\]+(?! )(\}|>)/g;

/**
 * Matches already-parsed API type references in Markdown link format
 * e.g. [`<Type>`](url)
 */
export const LINKS_WITH_TYPES = /\[`<([a-zA-Z0-9.| [\]]+)>`\]\((\S+)\)/g;

/**
 * Matches headings that start typed lists like "Returns:" or "Type:"
 */
export const TYPED_LIST_STARTERS = /^(Returns|Extends|Type):?\s*/;

/**
 * Matches references to Markdown pages in the API documentation
 */
export const MARKDOWN_URL = /^(?![+a-zA-Z]+:)([^#?]+)\.md(#.+)?$/;

/**
 * Matches Unix manual references like `ls(1)` or `printf(3c)`
 */
export const UNIX_MANUAL_PAGE = /\b([a-z.]+)\((\d)([a-z]?)\)/g;

/**
 * Matches just the Stability Index prefix value
 * e.g. Stability: 2
 */
export const STABILITY_INDEX_PREFIX = /Stability: ([0-5](?:\.[0-3])?)/;

/**
 * Matches Stability Index metadata lines
 * e.g. Stability: 1 - Experimental
 */
export const STABILITY_INDEX = new RegExp(
  `^${STABILITY_INDEX_PREFIX.source}(?:\\s*-\\s*)?(.*)$`,
  's'
);

/**
 * Extracts inner content from a YAML block
 */
export const YAML_INNER_CONTENT =
  /^<!--[ ]?(?:YAML([\s\S]*?)|([ \S]*?))?[ ]?-->/;
