'use strict';

// These are string replacements specific to Node.js API docs for anchor IDs
export const DOC_API_SLUGS_REPLACEMENTS = [
  { from: /node.js/i, to: 'nodejs' }, // Replace Node.js
  { from: /&/, to: '-and-' }, // Replace &
  { from: /[/_,:;\\ ]/g, to: '-' }, // Replace /_,:;\. and whitespace
  { from: /--+/g, to: '-' }, // Replace multiple hyphens with single
  { from: /^-/, to: '' }, // Remove any leading hyphen
  { from: /-$/, to: '' }, // Remove any trailing hyphen
];
