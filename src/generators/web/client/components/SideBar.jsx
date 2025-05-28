import SideBar from '@node-core/ui-components/Containers/SideBar';
import { useEffect, useState } from 'react';

/**
 * @typedef {Object} DocPage
 * @property {string} title - Page title (e.g., "Globals")
 * @property {Array<[string, string]>} headings - Array of [title, hash] pairs for page headings
 * @property {string} doc - Document filename (e.g., "globals.html")
 */

/**
 * @typedef {Object} SideBarProps
 * @property {Array<string>} versions - Available documentation versions
 * @property {string} currentVersion - Currently selected version
 * @property {Array<DocPage>} docPages - Documentation pages structure
 */

/**
 * Gets the current document filename with hash from the URL
 * @returns {string} The document filename with hash (e.g., "globals.html#section1")
 */
const getCurrentDoc = () => {
  const { pathname, hash } = window.location;
  const filename = pathname.split('/').pop();
  return filename + hash;
};

/**
 * Sidebar component for MDX documentation with version selection and page navigation
 * @param {SideBarProps} props - Component props
 * @param {Array<string>} props.versions - Available documentation versions
 * @param {string} props.currentVersion - Currently selected version
 * @param {Array<DocPage>} props.docPages - Documentation pages structure
 * @returns {JSX.Element} The rendered sidebar component
 */
export default function DocumentationSideBar({
  /* versions, currentVersion, */ docPages,
}) {
  const [pathname, setPathname] = useState(CLIENT ? getCurrentDoc() : '');

  useEffect(() => {
    /** Update the path */
    const updatePathname = () => setPathname(getCurrentDoc());
    window.addEventListener('hashchange', updatePathname);
    return () => window.removeEventListener('hashchange', updatePathname);
  }, []);

  const groups = docPages.map(({ title, headings, doc }) => ({
    groupName: title,
    items: headings.map(([title, hash]) => ({
      label: title,
      link: `${doc}#${hash}`,
    })),
  }));

  return (
    <SideBar
      pathname={pathname}
      groups={groups}
      onSelect={url => {
        window.location.href = url;
      }}
    />
  );
}
