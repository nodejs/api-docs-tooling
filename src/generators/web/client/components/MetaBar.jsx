import MetaBar from '@node-core/ui-components/Containers/MetaBar';
import GitHubIcon from '@node-core/ui-components/Icons/Social/GitHub.tsx';

export default ({ headings, addedIn, readingTime, viewAs, editThisPage }) => {
  return (
    <MetaBar
      heading="Table of Contents"
      headings={{ items: headings }}
      items={{
        'Added In': addedIn,
        'Reading Time': readingTime,
        'View As': viewAs.map(([title, path]) => <a href={path}>{title}</a>),
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
