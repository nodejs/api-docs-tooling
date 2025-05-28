import { CodeBracketIcon, DocumentIcon  } from '@heroicons/react/24/outline';
import MetaBar from '@node-core/ui-components/Containers/MetaBar';
import GitHubIcon from '@node-core/ui-components/Icons/Social/GitHub';
import { useEffect, useState } from 'react';

const iconMap = {
  JSON: CodeBracketIcon,
  MD: DocumentIcon,
};

/**
 * @typedef MetaBarProps
 * @property {Array<import('@vcarl/remark-headings').Heading>} headings - Array of page headings for table of contents
 * @property {string} addedIn - Version or date when feature was added
 * @property {string} readingTime - Estimated reading time for the page
 * @property {Array<[string, string]>} viewAs - Array of [title, path] tuples for view options
 * @property {string} editThisPage - URL for editing the current page
 */

/**
 * Filter headings to show only subitems when a level-2 heading is active
 * @param {Array<import('@vcarl/remark-headings').Heading>} headings - All headings
 * @param {string} hash - Current URL hash
 */
const filterHeadingsByHash = (headings, hash) => {
  if (!hash) {
    return headings; // Show all when nothing is active
  }

  // Find the active section by checking which level-2 heading contains the hash
  const activeSection = headings.find((heading, index) => {
    if (heading.depth !== 2) {
      return false;
    }

    // Get the next level-2 heading index
    const nextLevel2Index = headings.findIndex(
      (h, i) => i > index && h.depth === 2
    );
    const sectionEnd =
      nextLevel2Index === -1 ? headings.length : nextLevel2Index;

    // Check if hash is in this section
    return headings.slice(index, sectionEnd).some(h => h.slug === hash);
  });

  // Return the level-2 heading plus its sub-headings
  const activeSectionIndex = headings.indexOf(activeSection) + 1;
  const nextLevel2Index = headings.findIndex(
    (h, i) => i > activeSectionIndex && h.depth === 2
  );
  const sectionEnd = nextLevel2Index === -1 ? headings.length : nextLevel2Index;

  const sectionHeadings = headings
    .slice(activeSectionIndex, sectionEnd)
    .filter(h => h.depth > 2);
  if (sectionHeadings.length === 0) {
    return headings; // No subheadings, so return all
  }
  return sectionHeadings;
};

/**
 * MetaBar component that displays table of contents and page metadata
 * @param {MetaBarProps} props - Component props
 */
export default ({
  headings = [],
  addedIn,
  readingTime,
  viewAs = [],
  editThisPage,
}) => {
  const [hash, setHash] = useState('');

  useEffect(() => {
    /**
     *
     */
    const updateHash = () => setHash(window.location.hash.slice(1));
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  const filteredHeadings = filterHeadingsByHash(headings, hash);

  return (
    <MetaBar
      heading="Table of Contents"
      headings={{
        items: filteredHeadings.map(({ slug, ...heading }) => ({
          ...heading,
          data: { id: slug },
        })),
      }}
      items={{
        'Added In': addedIn,
        'Reading Time': readingTime,
        'View As': (
          <ol>
            {viewAs.map(([title, path]) => {
              const Icon = iconMap[title];
              return (
                <li key={title}>
                  <a href={path}>
                    {Icon && <Icon className="inline w-4 h-4 mr-1" />}
                    {title}
                  </a>
                </li>
              );
            })}
          </ol>
        ),
        Contribute: (
          <>
            <GitHubIcon className="fill-neutral-700 dark:fill-neutral-100" />
            <a href={editThisPage}>Edit this page</a>
          </>
        ),
      }}
    />
  );
};
