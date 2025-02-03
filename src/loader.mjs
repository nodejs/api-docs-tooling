'use strict';

import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { globSync } from 'glob';
import { VFile } from 'vfile';

/**
 * This method creates a simple abstract "Loader", which technically
 * could be used for different things, but here we want to use it to load
 * Markdown files and transform them into VFiles
 */
export const createMarkdownLoader = () => {
  /**
   * Loads API Doc files and transforms it into VFiles
   *
   * @param {string} searchPath A glob/path for API docs to be loaded
   * The input string can be a simple path (relative or absolute)
   * The input string can also be any allowed glob string
   *
   * @see https://code.visualstudio.com/docs/editor/glob-patterns
   */
  const loadFiles = searchPath => {
    const resolvedFiles = globSync(searchPath).filter(
      filePath => extname(filePath) === '.md'
    );

    return resolvedFiles.map(async filePath => {
      const fileContents = await readFile(filePath, 'utf-8');

      return new VFile({ path: filePath, value: fileContents });
    });
  };

  return { loadFiles };
};

/**
 * This creates a "loader" for loading Javascript source files into VFiles.
 */
export const createJsLoader = () => {
  /**
   * Loads the JavaScript source files and transforms them into VFiles
   *
   * @param {string | Array<string>} searchPath
   */
  const loadFiles = searchPath => {
    const resolvedFiles = globSync(searchPath).filter(
      filePath => extname(filePath) === '.js'
    );

    return resolvedFiles.map(async filePath => {
      const fileContents = await readFile(filePath, 'utf-8');

      return new VFile({ path: filePath, value: fileContents });
    });
  };

  return { loadFiles };
};
