import { OramaSearchButton, OramaSearchBox } from '@orama/react-components';

import { themeConfig } from './config.mjs';
import useOrama from '../../hooks/useOrama.mjs';

/**
 * Search component that provides documentation search functionality using Orama.
 *
 * @param {{ theme: string }} props - Component props.
 */
const SearchBox = ({ theme }) => {
  const client = useOrama();

  return (
    <>
      <OramaSearchButton
        aria-disabled={!client}
        style={{ flexGrow: 1 }}
        colorScheme={theme}
        themeConfig={themeConfig}
        aria-label="Search documentation"
      >
        Search documentation
      </OramaSearchButton>
      <OramaSearchBox
        aria-disabled={!client}
        disableChat={true}
        linksTarget="_self"
        clientInstance={client}
        colorScheme={theme}
        themeConfig={themeConfig}
      />
    </>
  );
};

export default SearchBox;
