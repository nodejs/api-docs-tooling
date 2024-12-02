'use strict';

import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { globSync } from 'glob';
import { VFile } from 'vfile';
import { existsSync } from 'node:fs';

/**
 * This method creates a simple abstract "Loader", which technically
 * could be used for different things, but here we want to use it to load
 * Markdown files and transform them into VFiles
 */
const createLoader = () => {
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

  /**
   * Loads the JavaScript source files and transforms them into VFiles
   *
   * @param {Array<string>} filePaths
   */
  const loadJsFiles = filePaths => {
    filePaths = filePaths.filter(filePath => existsSync(filePath));

    return filePaths.map(async filePath => {
      const fileContents = await readFile(filePath, 'utf-8');

      return new VFile({ path: filePath, value: fileContents });
    });
  };

  return { loadFiles, loadJsFiles };
};

export default createLoader;
