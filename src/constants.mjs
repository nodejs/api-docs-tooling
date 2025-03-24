'use strict';

// The current running version of Node.js (Environment)
export const DOC_NODE_VERSION = process.version;

// This is the Node.js CHANGELOG to be consumed to generate a list of all major Node.js versions
export const DOC_NODE_CHANGELOG_URL =
  'https://raw.githubusercontent.com/nodejs/node/HEAD/CHANGELOG.md';

// This is the Node.js Base URL for viewing a file within GitHub UI
export const DOC_NODE_BLOB_BASE_URL =
  'https://github.com/nodejs/node/blob/HEAD/';

// This is the Node.js API docs base URL for editing a file on GitHub UI
export const DOC_API_BLOB_EDIT_BASE_URL =
  'https://github.com/nodejs/node/edit/main/doc/api/';

// Base URL for a specific Node.js version within the Node.js API docs
export const DOC_API_BASE_URL_VERSION = 'https://nodejs.org/docs/latest-v';

// This is the perma-link within the API docs that reference the Stability Index
export const DOC_API_STABILITY_SECTION_REF_URL =
  'documentation.html#stability-index';

// These are YAML keys from the Markdown YAML metadata that should be
// removed and appended to the `update` key
export const DOC_API_YAML_KEYS_UPDATE = [
  'added',
  'removed',
  'deprecated',
  'introduced_in',
  'napiVersion',
];

// These are string replacements specific to Node.js API docs for anchor IDs
export const DOC_API_SLUGS_REPLACEMENTS = [
  { from: /node.js/i, to: 'nodejs' }, // Replace Node.js
  { from: /&/, to: '-and-' }, // Replace &
  { from: /[/_,:;\\ ]/g, to: '-' }, // Replace /_,:;\. and whitespace
  { from: /--+/g, to: '-' }, // Replace multiple hyphens with single
  { from: /^-/, to: '' }, // Remove any leading hyphen
  { from: /-$/, to: '' }, // Remove any trailing hyphen
];

// These are regular expressions used to determine if a given Markdown heading
// is a specific type of API Doc entry (e.g., Event, Class, Method, etc)
// and to extract the inner content of said Heading to be used as the API doc entry name
export const DOC_API_HEADING_TYPES = [
  {
    type: 'method',
    regex:
      // Group 1: foo[bar]()
      // Group 2: foo.bar()
      // Group 3: foobar()
      /^`?(?:\w*(?:(\[[^\]]+\])|(?:\.(\w+)))|(\w+))\([^)]*\)`?$/i,
  },
  { type: 'event', regex: /^Event: +`?['"]?([^'"]+)['"]?`?$/i },
  {
    type: 'class',
    regex:
      /^Class: +`?([A-Z]\w+(?:\.[A-Z]\w+)*(?: +extends +[A-Z]\w+(?:\.[A-Z]\w+)*)?)`?$/i,
  },
  {
    type: 'ctor',
    regex: /^(?:Constructor: +)?`?new +([A-Z]\w+(?:\.[A-Z]\w+)*)\([^)]*\)`?$/i,
  },
  {
    type: 'classMethod',
    regex:
      /^Static method: +`?[A-Z]\w+(?:\.[A-Z]\w+)*(?:(\[\w+\.\w+\])|\.(\w+))\([^)]*\)`?$/i,
  },
  {
    type: 'property',
    regex:
      /^(?:Class property: +)?`?[A-Z]\w+(?:\.[A-Z]\w+)*(?:(\[\w+\.\w+\])|\.(\w+))`?$/i,
  },
];

// This is a mapping for the `API` updates within the Markdown content and their respective
// content that should be mapping into `changes` property for better mapping on HTML
export const DOC_API_UPDATE_MAPPING = {
  added: 'Added in',
  removed: 'Removed in',
  deprecated: 'Deprecated since',
  introduced_in: 'Introduced in',
  napiVersion: 'N-API Version',
};

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#options
// This slug should reference the section where the available
// options are defined.
export const DOC_SLUG_OPTIONS = 'options';

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#environment-variables-1
// This slug should reference the section where the available
// environment variables are defined.
export const DOC_SLUG_ENVIRONMENT = 'environment-variables-1';

export const LINT_MESSAGES = {
  missingIntroducedIn: "Missing 'introduced_in' field in the API doc entry",
  missingChangeVersion: 'Missing version field in the API doc entry',
  invalidChangeVersion: 'Invalid version number: {{version}}',
};
