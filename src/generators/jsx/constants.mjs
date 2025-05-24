// Maps Node.js API stability indices (0-3) to UI component stability levels.
export const STABILITY_LEVELS = [
  'danger', // (0) Deprecated
  'warning', // (1) Experimental
  'success', // (2) Stable
  'info', // (3) Legacy
];

// Maps HTML tags to corresponding component names in @node-core/ui-components.
export const TAG_TRANSFORMS = {
  pre: 'CodeBox',
  blockquote: 'Blockquote',
};

// Maps API heading types to their CircularIcon props.
export const ICON_SYMBOL_MAP = {
  event: { symbol: 'E', color: 'red' },
  method: { symbol: 'M', color: 'red' },
  property: { symbol: 'P', color: 'red' },
  class: { symbol: 'C', color: 'red' },
  module: { symbol: 'M', color: 'red' },
  classMethod: { symbol: 'S', color: 'red' },
  ctor: { symbol: 'C', color: 'red' },
};

// Maps API lifecycle change type identifiers to their human-readable labels.
export const CHANGE_TYPES = {
  added_in: 'Added in',
  deprecated_in: 'Deprecated in',
  removed_in: 'Removed in',
  introduced_in: 'Introduced in',
};

export const AST_NODES = {
  MDX: {
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxtextelement
    JSX_INLINE_ELEMENT: 'mdxJsxTextElement',
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxflowelement
    JSX_BLOCK_ELEMENT: 'mdxJsxFlowElement',
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute
    JSX_ATTRIBUTE: 'mdxJsxAttribute',
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattributevalueexpression
    JSX_ATTRIBUTE_EXPRESSION: 'mdxJsxAttributeValueExpression',
  },
  ESTREE: {
    // https://github.com/estree/estree/blob/master/es5.md#programs
    PROGRAM: 'Program',
    // https://github.com/estree/estree/blob/master/es5.md#expressionstatement
    EXPRESSION_STATEMENT: 'ExpressionStatement',
  },
};
