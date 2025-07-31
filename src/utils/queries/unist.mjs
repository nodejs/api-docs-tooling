import {
  LINKS_WITH_TYPES,
  MARKDOWN_URL,
  STABILITY_INDEX,
  TYPE_EXPRESSION,
  TYPED_LIST_STARTERS,
  UNIX_MANUAL_PAGE,
  YAML_INNER_CONTENT,
} from './regex.mjs';
import { transformNodesToString } from '../unist.mjs';

/**
 * @param {import('@types/mdast').Blockquote} blockquote
 * @returns {boolean}
 */
export const isStabilityNode = ({ type, children }) =>
  type === 'blockquote' &&
  STABILITY_INDEX.test(transformNodesToString(children));

/**
 * @param {import('@types/mdast').Html} html
 * @returns {boolean}
 */
export const isYamlNode = ({ type, value }) =>
  type === 'html' && YAML_INNER_CONTENT.test(value);

/**
 * @param {import('@types/mdast').Text} text
 * @returns {boolean}
 */
export const isTextWithType = ({ type, value }) =>
  type === 'text' && TYPE_EXPRESSION.test(value);

/**
 * @param {import('@types/mdast').Text} text
 * @returns {boolean}
 */
export const isTextWithUnixManual = ({ type, value }) =>
  type === 'text' && UNIX_MANUAL_PAGE.test(value);

/**
 * @param {import('@types/mdast').Html} html
 * @returns {boolean}
 */
export const isHtmlWithType = ({ type, value }) =>
  type === 'html' && LINKS_WITH_TYPES.test(value);

/**
 * @param {import('@types/mdast').Link} link
 * @returns {boolean}
 */
export const isMarkdownUrl = ({ type, url }) =>
  type === 'link' && MARKDOWN_URL.test(url);

/**
 * @param {import('@types/mdast').Heading} heading
 * @returns {boolean}
 */
export const isHeading = ({ type, depth }) =>
  type === 'heading' && depth >= 1 && depth <= 5;

/**
 * @param {import('@types/mdast').LinkReference} linkReference
 * @returns {boolean}
 */
export const isLinkReference = ({ type, identifier }) =>
  type === 'linkReference' && !!identifier;

/**
 * @param {import('@types/mdast').List} list
 * @returns {boolean}
 */
export const isTypedList = list => {
  if (list.type !== 'list') {
    return false;
  }

  const [node, ...contentNodes] =
    list?.children?.[0]?.children?.[0]?.children ?? [];

  if (!node) {
    return false;
  }

  if (node.value?.trimStart().match(TYPED_LIST_STARTERS)) {
    return true;
  }

  if (node.type === 'link' && node.children?.[0]?.value?.[0] === '<') {
    return true;
  }

  if (
    node.type === 'inlineCode' &&
    contentNodes[0]?.value.trim() === '' &&
    contentNodes[1]?.type === 'link' &&
    contentNodes[1]?.children?.[0]?.value?.[0] === '<'
  ) {
    return true;
  }

  return false;
};
