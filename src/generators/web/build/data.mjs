import { shiki } from '@node-core/rehype-shiki';

/**
 * This creates static data that the server can pass to the client,
 * since there are cases (for example, Shiki's display name map) where
 * we want to load a large set of data on the server, and only pass
 * a small subset of information to the client.
 */
export const createStaticData = () => {
  const shikiDisplayNameMap = [
    ...new Map(
      shiki
        .getLoadedLanguages()
        .map(shiki.getLanguage)
        .map(({ name, _grammar: { aliases = [], displayName } }) => [
          name,
          [[...aliases, name], displayName],
        ])
    ).values(),
  ];

  return {
    /** @type {Array<[string[], string]>} */
    shikiDisplayNameMap,
  };
};

const staticData = JSON.stringify(createStaticData());
export default staticData;
