'use strict';

import createMetadata from './metadata.mjs';
import createQueries from './queries.mjs';
import { calculateCodeBlockIntersection } from './utils/parser.mjs';

/**
 * Creates an API Doc Parser for a given Markdown API Doc
 * (this requires already parsed Node.js release data, the API doc file to be loaded, and etc)
 *
 * @param {import('./types.d.ts').ApiDocMetadata} fileMetadata API Doc Metadata
 * @param {string} markdownContent
 */
const getParser = (fileMetadata, markdownContent) => {
  const { newMetadataEntry, getNavigationEntries: getNavigation } =
    createMetadata(fileMetadata);

  const parseMetadata = () => {
    const markdownSections = markdownContent.split('\n\n#');

    const isCurrentLinesCodeBlock = calculateCodeBlockIntersection();

    const parsedSections = markdownSections.map(section => {
      const apiEntryMetadata = newMetadataEntry();

      const {
        markdownFootUrls,
        addHeadingLevel,
        normalizeLinks,
        normalizeTypes,
        normalizeHeading,
        parseYAML,
      } = createQueries(apiEntryMetadata, fileMetadata);

      const parsedLines = section.split('\n\n').map(lines => {
        // This verifies if the current lines are part of a multi-line code block
        // This allows us to simply ignore any modification during this time
        if (isCurrentLinesCodeBlock(lines)) {
          return lines;
        }

        // Line Block starts is a Heading
        if (lines.startsWith('#')) {
          apiEntryMetadata.setHeading(lines);

          return lines
            .replace(createQueries.QUERIES.addHeadingLevel, addHeadingLevel)
            .replace(createQueries.QUERIES.normalizeHeading, normalizeHeading);
        }

        // Line Block is a YAML Metadata
        if (lines.startsWith('<!--')) {
          return lines.replace(createQueries.QUERIES.parseYAML, parseYAML);
        }

        // Line Block is remaining content, such as description, types, params, etc
        return lines
          .replace(createQueries.QUERIES.normalizeLinks, normalizeLinks)
          .replace(createQueries.QUERIES.normalizeTypes, normalizeTypes)
          .replace(createQueries.QUERIES.markdownFootUrls, markdownFootUrls);
      });

      return apiEntryMetadata.create(parsedLines.filter(Boolean).join('\n\n'));
    });

    return parsedSections;
  };

  return { getNavigation, parseMetadata };
};

export default getParser;
