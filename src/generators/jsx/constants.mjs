// Maps the the stability index (0-3) to the level used by @node-core/ui-components
export const STABILITY_LEVELS = [
  'danger', // (0) Deprecated
  'warning', // (1) Experimental
  'success', // (2) Stable
  'info', // (3) Legacy
];

// Maps HTML tags to corresponding component names in @node-core/ui-components
export const TAG_TRANSFORMS = {
  pre: 'CodeBox',
  blockquote: 'Blockquote',
};

// Maps types to icon symbols
export const ICON_SYMBOL_MAP = {
  event: { symbol: 'E', color: 'red' },
  method: { symbol: 'M', color: 'red' },
  property: { symbol: 'P', color: 'red' },
  class: { symbol: 'C', color: 'red' },
  module: { symbol: 'M', color: 'red' },
  classMethod: { symbol: 'S', color: 'red' },
  ctor: { symbol: 'C', color: 'red' },
};

export const CHANGE_TYPES = {
  added_in: 'Added in',
  deprecated_in: 'Deprecated in',
  removed_in: 'Removed in',
  introduced_in: 'Introduced in',
};
