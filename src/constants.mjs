'use strict';

// The current running version of Node.js (Environment)
export const DOC_NODE_VERSION = process.version;

// This is the Node.js CHANGELOG to be consumed to generate a list of all major Node.js versions
export const DOC_NODE_CHANGELOG_URL =
  'https://raw.githubusercontent.com/nodejs/node/HEAD/CHANGELOG.md';

// This is the perma-link within the API docs that reference the Stability Index
export const DOC_API_STABILITY_SECTION_REF_URL =
  'documentation.html#stability-index';

// These are string replacements specific to Node.js API docs for anchor IDs
export const DOC_API_SLUGS_REPLACEMENTS = [
  { from: /node.js/i, to: 'nodejs' }, // Replace Node.js
  { from: /&/, to: '-and-' }, // Replace &
  { from: /[/_,:;\\ ]/g, to: '-' }, // Replace /_,:;\. and whitespace
  { from: /--+/g, to: '-' }, // Replace multiple hyphens with single
  { from: /^-/, to: '' }, // Remove any leading hyphen
  { from: /-$/, to: '' }, // Remove any trailing hyphen
];

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#options
// This slug should reference the section where the available
// options are defined.
export const DOC_SLUG_OPTIONS = 'options';

// https://github.com/nodejs/node/blob/main/doc/api/cli.md#environment-variables-1
// This slug should reference the section where the available
// environment variables are defined.
export const DOC_SLUG_ENVIRONMENT = 'environment-variables-1';
