import { create, load } from '@orama/orama';
import { useState, useEffect } from 'react';

/**
 * Hook for initializing and managing Orama search database
 */
export default () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Create the database instance
    const db = create({
      schema: {},
    });

    setClient(db);

    // Load the search data
    fetch('orama-db.json')
      .then(response => response.ok && response.json())
      .then(data => load(db, data));
  }, []);

  return client;
};
