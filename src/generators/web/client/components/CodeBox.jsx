import { useState } from 'react';
import BaseCodeBox from '@node-core/ui-components/Common/BaseCodeBox';
import { staticData } from '../data.mjs';

const languageDisplayNameMap = new Map(staticData.shikiDisplayNameMap);

/**
 * Get the display name of a language
 * @param {string} language The language ID
 */
export const getLanguageDisplayName = language => {
  const entry = Array.from(languageDisplayNameMap.entries()).find(([aliases]) =>
    aliases.includes(language.toLowerCase())
  );

  return entry?.[1] ?? language.toLowerCase();
};

const MDXCodeBox = ({ className, ...props }) => {
  const matches = className?.match(/language-(?<language>[a-zA-Z]+)/);
  const language = matches?.groups?.language ?? '';
  const [copyText, setCopyText] = useState('Copy to clipboard');

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
      copyText={copyText}
    />
  );
};

export default MDXCodeBox;
