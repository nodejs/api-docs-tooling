import { create, load } from '@orama/orama';
import { OramaSearchButton, OramaSearchBox } from '@orama/react-components';
import { useState, useEffect } from 'react';

import { themeConfig } from './config.mjs';
import { useTheme } from '../../hooks/useTheme.mjs';

/**
 * Search component that provides documentation search functionality using Orama
 */
const MDXSearchBox = () => {
  const [colorScheme] = useTheme();
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

        // Set the client immediately so it's available
        setClient(db);

        // Then fetch and load the data
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
        colorScheme={colorScheme}
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
        colorScheme={colorScheme}
        themeConfig={themeConfig}
      />
    </>
  );
};

export default MDXSearchBox;
