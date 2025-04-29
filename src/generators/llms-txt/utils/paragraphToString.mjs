/**
 * Extracts text content from a node recursively
 *
 * @param {import('mdast').Paragraph} node The AST node to extract text from
 * @returns {string} The extracted text content
 */
function extractTextContent(node) {
  if (!node) {
    return '';
  }

  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextContent).join('');
  }

  return '';
}

/**
 * Extracts text from a paragraph node.
 *
 * @param {import('mdast').Paragraph} node The paragraph node to extract text from
 * @returns {string} The extracted text content
 * @throws {Error} If the node is not a paragraph
 */
export function paragraphToString(node) {
  if (node.type !== 'paragraph') {
    throw new Error('Node is not a paragraph');
  }

  return node.children.map(extractTextContent).join('');
}
