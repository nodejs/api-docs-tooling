/**
 * UI classes for Node.js API stability levels
 *
 * @see https://nodejs.org/api/documentation.html#stability-index
 */
export const STABILITY_LEVELS = [
  'danger', // (0) Deprecated
  'warning', // (1) Experimental
  'success', // (2) Stable
  'info', // (3) Legacy
];

/**
 * HTML tag to UI component mappings
 */
export const TAG_TRANSFORMS = {
  pre: 'CodeBox',
  blockquote: 'Blockquote',
};

/**
 * @see transformer.mjs's TODO comment
 */
export const TYPE_TRANSFORMS = {
  raw: 'text',
};

/**
 * API type icon configurations
 */
export const API_ICONS = {
  event: { symbol: 'E', color: 'red' },
  method: { symbol: 'M', color: 'red' },
  property: { symbol: 'P', color: 'red' },
  class: { symbol: 'C', color: 'red' },
  module: { symbol: 'M', color: 'red' },
  classMethod: { symbol: 'S', color: 'red' },
  ctor: { symbol: 'C', color: 'red' },
};

/**
 * API lifecycle change labels
 */
export const LIFECYCLE_LABELS = {
  added_in: 'Added in',
  deprecated_in: 'Deprecated in',
  removed_in: 'Removed in',
  introduced_in: 'Introduced in',
};

// TODO(@avivkeller): These should be inherited from @node-core/website-i18n
export const INTERNATIONALIZABLE = {
  sourceCode: 'Source Code: ',
};

/**
 * Abstract Syntax Tree node type constants
 */
export const AST_NODE_TYPES = {
  MDX: {
    /**
     * Text-level JSX element
     *
     * @see https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxtextelement
     */
    JSX_INLINE_ELEMENT: 'mdxJsxTextElement',

    /**
     * Block-level JSX element
     *
     * @see https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxflowelement
     */
    JSX_BLOCK_ELEMENT: 'mdxJsxFlowElement',

    /**
     * JSX attribute
     *
     * @see https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute
     */
    JSX_ATTRIBUTE: 'mdxJsxAttribute',

    /**
     * JSX expression attribute
     *
     * @see https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattributevalueexpression
     */
    JSX_ATTRIBUTE_EXPRESSION: 'mdxJsxAttributeValueExpression',
  },
  ESTREE: {
    /**
     * AST Program node
     *
     * @see https://github.com/estree/estree/blob/master/es5.md#programs
     */
    PROGRAM: 'Program',

    /**
     * Expression statement
     *
     * @see https://github.com/estree/estree/blob/master/es5.md#expressionstatement
     */
    EXPRESSION_STATEMENT: 'ExpressionStatement',
  },
  // TODO(@avivkeller): These should be inherited from the elements themselves
  JSX: {
    ALERT_BOX: 'AlertBox',
    CHANGE_HISTORY: 'ChangeHistory',
    CIRCULAR_ICON: 'CircularIcon',
    NAV_BAR: 'NavBar',
    ARTICLE: 'Article',
    SIDE_BAR: 'SideBar',
    META_BAR: 'MetaBar',
    FOOTER: 'Footer',
  },
};
