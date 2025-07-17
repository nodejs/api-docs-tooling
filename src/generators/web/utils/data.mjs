import { shiki } from '@node-core/rehype-shiki';

/**
 * Constructs a set of static, minimal data to send from server to client.
 *
 * Why this exists:
 * - Shiki loads large language grammars and metadata internally.
 * - We want to avoid sending all of this data to the client.
 * - Instead, we extract only a **lightweight map** of language identifiers and display names
 *
 * This data is serializable and efficient to send to the browser.
 */
export const createStaticData = () => {
  // Create a display name map with aliases from Shiki's loaded languages
  const shikiDisplayNameMap = [
    ...new Map(
      // 1. Get all currently loaded language identifiers (e.g., 'js', 'ts', 'python')
      shiki
        .getLoadedLanguages()

        // 2. Map each ID to its full language object
        .map(shiki.getLanguage)

        // 3. Extract:
        //   - `name`: canonical ID (e.g., "javascript")
        //   - `_grammar.aliases`: alternate names for the language (e.g., ["js"])
        //   - `displayName`: user-friendly name for UI (e.g., "JavaScript")
        //
        // 4. Build key-value pairs of:
        //   name => [[aliases + name], displayName]
        //
        // Example output:
        //   "javascript" => [["js", "javascript"], "JavaScript"]
        //
        // This structure allows clients to match by any alias and still show a clean label.
        .map(({ name, _grammar: { aliases = [], displayName } }) => [
          name,
          [[...aliases, name], displayName],
        ])

      // Step 5: Deduplicate by canonical name using a `Map`
      // The `Map` constructor ensures uniqueness by key (`name`)
    ).values(), // Get just the values (alias/displayName pairs)
  ];

  return {
    /** @type {Array<[Array<string>, string]>} */
    shikiDisplayNameMap,
  };
};

// Export the JSON-encoded version as the module default.
// This makes it easier to inject into other parts of the build (e.g. via `define` in a bundler),
// allowing it to be inlined at compile time as a literal object.
export default JSON.stringify(createStaticData());
