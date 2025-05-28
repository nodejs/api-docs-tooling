import { create, load } from '@orama/orama';
import { OramaSearchButton, OramaSearchBox } from '@orama/react-components';
import { useState, useEffect } from 'react';

import { themeConfig } from './config.mjs';

/**
 * Search component that provides documentation search functionality using Orama.
 *
 * @param {{ theme: string }} props - Component props.
 */
const SearchBox = ({ theme }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Initialize Orama search database and load search data
     */
    const initializeOrama = async () => {
      try {
        const db = create({
          schema: {},
        });

        setClient(db);

        const response = await fetch('orama-db.json');
        if (response.ok) {
          load(db, await response.json());
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrama();
  }, []);

  return (
    <>
      <OramaSearchButton
        aria-disabled={!client || isLoading}
        style={{ flexGrow: 1 }}
        colorScheme={theme}
        themeConfig={themeConfig}
        aria-label="Search documentation"
      >
        Search documentation
      </OramaSearchButton>
      <OramaSearchBox
        aria-disabled={!client || isLoading}
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
