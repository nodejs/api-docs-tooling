import {
  getCompatibleVersions,
  groupNodesByModule,
} from '../../utils/generators.mjs';
import buildContent from './utils/buildContent.mjs';
import { getRemarkRecma } from '../../utils/remark.mjs';
import { buildSideBarDocPages } from './utils/buildBarProps.mjs';

/**
 * This generator generates a JSX AST from an input MDAST
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'jsx-ast',
  version: '1.0.0',
  description: 'Generates JSX AST from the input MDAST',
  dependsOn: 'ast',

  /**
   * Generates a JSX AST
   *
   * @param {Input} entries
   * @param {Partial<GeneratorOptions>} options
   * @returns {Promise<Array<string>>} Array of generated content
   */
  async generate(entries, { releases, version }) {
    const remarkRecma = getRemarkRecma();
    const groupedModules = groupNodesByModule(entries);

    // Get sorted primary heading nodes
    const headNodes = entries
      .filter(node => node.heading.depth === 1)
      .sort((a, b) => a.heading.data.name.localeCompare(b.heading.data.name));

    // Generate table of contents
    const docPages = buildSideBarDocPages(groupedModules, headNodes);

    // Process each head node and build content
    const results = await Promise.all(
      headNodes.map(entry => {
        const versions = getCompatibleVersions(
          entry.introduced_in,
          releases,
          true
        );

        const sideBarProps = {
          versions: versions.map(({ version }) => `v${version.version}`),
          currentVersion: `v${version.version}`,
          currentPage: `${entry.api}.html`,
          docPages,
        };

        return buildContent(
          groupedModules.get(entry.api),
          entry,
          sideBarProps,
          remarkRecma
        );
      })
    );

    return results;
  },
};
