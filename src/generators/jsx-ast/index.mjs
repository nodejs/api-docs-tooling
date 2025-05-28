import { OVERRIDDEN_POSITIONS } from './constants.mjs';
import buildContent from './utils/buildContent.mjs';
import {
  getCompatibleVersions,
  getVersionFromSemVer,
  getVersionURL,
  groupNodesByModule,
} from '../../utils/generators.mjs';
import { getRemarkRecma } from '../../utils/remark.mjs';

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
  dependsOn: 'metadata',

  /**
   * Generates a JSX AST
   *
   * @param {Input} entries
   * @param {Partial<GeneratorOptions>} options
   * @returns {Promise<Array<string>>} Array of generated content
   */
  async generate(entries, { index, releases, version }) {
    const remarkRecma = getRemarkRecma();
    const groupedModules = groupNodesByModule(entries);

    // Get sorted primary heading nodes
    const headNodes = entries
      .filter(node => node.heading.depth === 1)
      .sort((a, b) => {
        const ai = OVERRIDDEN_POSITIONS.indexOf(a.api),
          bi = OVERRIDDEN_POSITIONS.indexOf(b.api);
        // If this is in OVERRIDDEN_POSITIONS, it must come first
        return ai !== -1 && bi !== -1
          ? ai - bi
          : ai !== -1
            ? -1
            : bi !== -1
              ? 1
              : // Just compare headings
                a.heading.data.name.localeCompare(b.heading.data.name);
      });

    // Generate table of contents
    const docPages = index
      ? index.map(({ section, api }) => [section, `${api}.html`])
      : headNodes.map(node => [node.heading.data.name, `${node.api}.html`]);

    // Process each head node and build content
    const results = await Promise.all(
      headNodes.map(entry => {
        const versions = getCompatibleVersions(
          entry.introduced_in,
          releases,
          true
        );

        const sideBarProps = {
          versions: versions.map(({ version, isLts, isCurrent }) => {
            const parsed = getVersionFromSemVer(version);
            let label = `v${parsed}`;

            if (isLts) {
              label += ' (LTS)';
            }

            if (isCurrent) {
              label += ' (Current)';
            }

            return {
              value: getVersionURL(parsed, entry.api),
              label,
            };
          }),
          currentVersion: `v${version.version}`,
          pathname: `${entry.api}.html`,
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
