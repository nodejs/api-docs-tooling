/**
 * We need the files to be in a hierarchy based off of depth, but they're
 *  given to us flattened. So, let's fix that.
 *
 * Assuming that {@link entries} is in the same order as the elements are in
 *  the markdown, we can use the entry's depth property to reassemble the
 *  hierarchy.
 *
 * If depth <= 1, it's a top-level element (aka a root).
 *
 * If it's depth is greater than the previous entry's depth, it's a child of
 *  the previous entry. Otherwise (if it's less than or equal to the previous
 *  entry's depth), we need to find the entry that it was the greater than. We
 *  can do this by just looping through entries in reverse starting at the
 *  current index - 1.
 *
 * @param {Array<ApiDocMetadataEntry>} entries
 * @returns {Array<import('../types.d.ts').HierarchizedEntry>}
 */
export function buildHierarchy(entries) {
  const roots = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const currentDepth = entry.heading.depth;

    if (currentDepth <= 1) {
      // We're a top-level entry
      roots.push(entry);
      continue;
    }

    const previousEntry = entries[i - 1];

    const previousDepth = previousEntry.heading.depth;
    if (currentDepth > previousDepth) {
      // We're a child of the previous one
      if (previousEntry.hierarchyChildren === undefined) {
        previousEntry.hierarchyChildren = [];
      }

      previousEntry.hierarchyChildren.push(entry);
    } else {
      if (i < 2) {
        throw new Error(`can't find parent since i < 2 (${i})`);
      }

      // Loop to find the entry we're a child of
      for (let j = i - 2; j >= 0; j--) {
        const jEntry = entries[j];
        const jDepth = jEntry.heading.depth;

        if (currentDepth > jDepth) {
          // Found it
          jEntry.hierarchyChildren.push(entry);
          break;
        }
      }
    }
  }

  return roots;
}
