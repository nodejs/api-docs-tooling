/**
 * So we need the files to be in a hierarchy based off of depth, but they're
 *  given to us flattened. So, let's fix that in a way that's incredibly
 *  unfortunate but works!
 * @param {ApiDocMetadataEntry[]} entries
 * @returns {import('../types.d.ts').HierarchizedEntry[]}
 */
export function buildHierarchy(entries) {
  const roots = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const currentDepth = entry.heading.depth;

    if (currentDepth === 1) {
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
      for (let j = i - 2; j >= 0; j--) {
        const jEntry = entries[j];
        const jDepth = jEntry.heading.depth;
        if (currentDepth > jDepth) {
          jEntry.hierarchyChildren.push(entry);
          break;
        }
      }
    }
  }

  return roots;
}
