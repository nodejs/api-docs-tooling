import { shiki } from '@node-core/rehype-shiki';

/**
 * This creates the static data for the client. For example,
 * the map of language display names, without loading Shiki,
 * a very large module, on the client.
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
