import BaseCodeBox from '@node-core/ui-components/Common/BaseCodeBox';
import { useState } from 'react';

import { STATIC_DATA } from '../constants.mjs';

const languageDisplayNameMap = new Map(STATIC_DATA.shikiDisplayNameMap);

/**
 * Get the display name of a language
 * @param {string} language - The language ID
 */
export const getLanguageDisplayName = language => {
  const entry = Array.from(languageDisplayNameMap.entries()).find(([aliases]) =>
    aliases.includes(language.toLowerCase())
  );

  return entry?.[1] ?? language.toLowerCase();
};

/**
 * @typedef CodeBoxProps
 * @property {string} [className] - CSS class with language info
 */

/**
 * Code box component with syntax highlighting and copy functionality
 * @param {import('react').PropsWithChildren<CodeBoxProps>} props
 */
export default ({ className, ...props }) => {
  const matches = className?.match(/language-(?<language>[a-zA-Z]+)/);
  const language = matches?.groups?.language ?? '';
  const [copyText, setCopyText] = useState('Copy to clipboard');

  /**
   * Copy text to clipboard and show feedback
   * @param {string} text - Text to copy
   */
  const handleCopy = async text => {
    await navigator.clipboard.writeText(text);

    setCopyText('Copied to clipboard!');
    setTimeout(() => {
      setCopyText('Copy to clipboard');
    }, 500);
  };

  return (
    <BaseCodeBox
      as={'a'}
      onCopy={handleCopy}
      language={getLanguageDisplayName(language)}
      {...props}
      buttonText={copyText}
    />
  );
};
